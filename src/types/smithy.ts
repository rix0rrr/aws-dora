
export interface SmithyModel {
  smithy: "2.0";
  shapes?: Record<string, Shape>;
}

export type Shape = Service | Resource | Operation | Value;
export type Value = Structure | PrimitiveType | ListType | MapType | Unit | Union | Enum;

export interface ResourceHaver {
  operations?: ShapeRef[];
  resources?: ShapeRef[];
}

export function isService(x: Shape): x is Service {
  return x.type === "service";
}

export interface Service extends ResourceHaver {
  type: "service";
  version: string;
  traits?: Traits;
}

export interface Resource extends ResourceHaver {
  type: "resource";
  create?: ShapeRef;
  put?: ShapeRef;
  read?: ShapeRef;
  update?: ShapeRef;
  list?: ShapeRef;
}

export interface ListType {
  type: "list";
  member: ShapeRef;
  traits?: Traits;
}

export interface MapType {
  type: "map";
  key: ShapeRef;
  value: ShapeRef;
  traits?: Traits;
}

export interface Union {
  type: "union";
  members: Record<string, ShapeRef>;
  traits?: Traits;
}

export interface Enum {
  type: "enum";
  members: Record<string, ShapeRef>;
  traits?: Traits;
}

export interface Operation {
  type: "operation";
  input: ShapeRef;
  output: ShapeRef;
  errors?: ShapeRef[];
  traits?: Traits;
}

export interface Structure {
  type: "structure";
  members: Record<string, ShapeRef>;
  traits?: Traits;
}

export interface PrimitiveType {
  type: "string" | "long" | "integer" | "boolean" | "double" | "float" | "timestamp" | "blob" | "document";
  traits?: Traits;
}

export interface Unit {
  type: "unit";
  traits?: Traits;
}

export interface ShapeRef {
  target: string;
  traits?: Traits;
}

export type Traits = Record<string, any>;

export function assertType<T extends Shape['type']>(t: T, s: Shape): Extract<Shape, { type: T }> {
  if (s.type !== t) {
    throw new Error(`Shape ${s.type} is not of type ${t}`);
  }
  return s as any;
}

export function assertValue(s: Shape): Value {
  if (!['structure', 'list', 'map', 'string', 'boolean', 'integer', 'long', 'double', 'timestamp', 'blob', 'union', 'enum', 'float', 'document'].includes(s.type)) {
    throw new Error(`Shape ${s.type} is not a value type`);
  }
  return s as any;
}

export function builtinShape(shapeId: string): Value | undefined {
  switch (shapeId.toLowerCase()) {
    case 'smithy.api#string': return { type: 'string' };
    case 'smithy.api#long': return { type: 'long' };
    case 'smithy.api#float': return { type: 'float' };
    case 'smithy.api#double': return { type: 'double' };
    case 'smithy.api#primitiveboolean': return { type: 'boolean' };
    case 'smithy.api#boolean': return { type: 'boolean' };
    case 'smithy.api#blob': return { type: 'blob' };
    case 'smithy.api#integer': return { type: 'integer' };
    case 'smithy.api#timestamp': return { type: 'timestamp' };
    case 'smithy.api#unit': return { type: 'unit' };
    case 'smithy.api#document': return { type: 'document' };
  };

  return undefined;
}