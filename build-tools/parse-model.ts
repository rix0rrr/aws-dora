import * as fs from 'fs/promises';
import * as path from 'path';
import { AWSOperation, AWSResourceHaver, AWSResource, AWSService, AWSServiceList } from '../src/types/model';
import { isService, Operation, Resource, ResourceHaver, Service, Shape, SmithyModel, Structure, ShapeRef, Value, assertType, assertValue, Unit, builtinShape } from '../src/types/smithy';

async function main() {
  const outputFile = path.join(__dirname, '..', 'data', 'aws-services.json');

  const smithyFiles = await fs.readdir(path.join(__dirname, '../vendor/aws-sdk-js-v3/aws-models'), { withFileTypes: true });

  const services: AWSService[] = [];
  for (const f of smithyFiles) {
    if (f.isFile() && f.name.endsWith('.json')) {
      const smithy: SmithyModel = JSON.parse(await fs.readFile(path.join(f.parentPath, f.name), 'utf-8'));
      services.push(...await readServicesFromModelFile(f.name.replace(/\.json$/, ''), smithy));
    }
  }

  const awsModel: AWSServiceList = {
    services: sortByName(services),
  };

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, JSON.stringify(awsModel, null, 2), 'utf-8');
}

async function readServicesFromModelFile(fileName: string, model: SmithyModel): Promise<AWSService[]> {
  const services = Object.entries(model.shapes ?? {})
    .flatMap(([id, shp]) => isService(shp) ? [parseService(fileName, id, shp, model)] : []);

  return services;
}

function parseService(fileName: string, id: string, smithyService: Service, model: SmithyModel): AWSService {
  const name = smithyService.traits?.['smithy.api#title'] ?? id;
  const shortName = fileName;
  const className = smithyService.traits?.['aws.api#service']?.sdkId;

  return {
    name,
    shortName,
    className,
    ...parseResourceHaver(id, smithyService, model, shortName, shortName),
  };
}

function parseResource(id: string, resource: Resource, model: SmithyModel, serviceId: string, parentNodeId: string): AWSResource {
  const rs = parseResourceHaver(id, resource, model, serviceId, parentNodeId);
  const crud = [resource.create, resource.put, resource.read, resource.update, resource.list]
    .flatMap((x) => x ? [parseOperation(x.target, assertType('operation', shape(x, model)), model, serviceId)] : []);

  return {
    name: localId(id),
    nodeId: `${parentNodeId}.${localId(id)}`,
    operations: sortByName(rs.operations.concat(crud)),
    resources: rs.resources,
  };
}

function parseOperation(id: string, operation: Operation, model: SmithyModel, serviceId: string): AWSOperation {
  const inputShape = shape(operation.input, model);
  if (inputShape.type !== 'structure' && inputShape.type !== 'unit') {
    throw new Error(`Operation ${id} input must be a structure or unit, got ${inputShape.type}`);
  }

  const name = localId(id);

  return {
    name,
    operationId: `${serviceId}.${localId(id)}`,
    methodName: name.slice(0, 1).toLowerCase() + name.slice(1),
    description: operation.traits?.['aws.api#documentation'],
    requestTemplate: exampleValue(localId(operation.input.target), inputShape, model),
  };
}

function exampleValue(key: string, x: Structure | Unit, model: SmithyModel): Record<string, unknown>;
function exampleValue(key: string, x: Value, model: SmithyModel): unknown;
function exampleValue(key: string, x: Value, model: SmithyModel): unknown {
  const recursionBreaker = new Set<Shape>();
  return recurse(key, x);

  function recurse(kk: string, vv: Value): any {
    recursionBreaker.add(vv);
    try {
      switch (vv.type) {
        case 'structure':
          return Object.fromEntries(Object.entries(vv.members)
            .filter(([_, v]) => !recursionBreaker.has(shape(v, model)))
            .map(([k, v]) => [k, recurse(k, assertValue(shape(v, model)))]));
        case 'list':
          const elShape = assertValue(shape(vv.member, model));
          return !recursionBreaker.has(elShape) ? [recurse(kk, elShape)] : [];
        case 'map':
          const valueShape = assertValue(shape(vv.value, model));
          if (recursionBreaker.has(valueShape)) {
            return {};
          }
          const keyValue = recurse(`${kk}Key`, assertValue(shape(vv.key, model)));
          const valueValue = recurse(`${kk}Value`, valueShape);
          return { [keyValue as any]: valueValue };
        case 'string':
        case 'document':
          return kk;
        case 'boolean':
          return true;
        case 'integer':
        case 'long':
        case 'double':
        case 'float':
          return 123;
        case 'timestamp':
          return '2000-01-01T00:00:00Z';
        case 'blob':
          return `${kk}Data`;
        case 'unit':
          return {};
        case 'union':
          const firstBranch = assertValue(shape(Object.values(vv.members)[0], model));
          return recurse(kk, firstBranch);
        case 'enum':
          const firstShapeRef = Object.values(vv.members)[0];
          return firstShapeRef.traits?.['smithy.api#enumValue'] ?? kk;
        default:
          assertNever(vv);
      }
    } finally {
      recursionBreaker.delete(vv);
    }
  }
}

function parseResourceHaver(id: string, haver: ResourceHaver, model: SmithyModel, serviceId: string, parentNodeId: string): AWSResourceHaver {
  return {
    nodeId: `${parentNodeId}.${localId(id)}`,
    resources: sortByName((haver.resources ?? []).map((r) => parseResource(r.target, assertType('resource', shape(r, model)), model, serviceId, parentNodeId))),
    operations: sortByName((haver.operations ?? []).map((op) => parseOperation(op.target, assertType('operation', shape(op, model)), model, serviceId))),
  };
}

function shape(id: string | ShapeRef, model: SmithyModel): Shape {
  const key = typeof id === 'string' ? id : id.target;
  const builtin = builtinShape(key);
  if (builtin) {
    return builtin;
  }

  const ret = model.shapes?.[key];
  if (!ret) {
    throw new Error(`Shape ${key} not found in model`);
  }
  return ret;
}

function localId(x: string) {
  return x.split('#')[1];
}

function sortByName<A extends { name: string }>(array: A[]): A[] {
  return array.sort((a, b) => a.name.localeCompare(b.name));
}

function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(x)}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

