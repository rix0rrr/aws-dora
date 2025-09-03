import * as fs from 'fs/promises';
import path from 'path';
import { AWSOperation, AWSResource, AWSResourceHaver, AWSService, AWSServiceList } from '../types/model';


export class AwsServiceModelView {
  public static async fromBuiltinModel(): Promise<AwsServiceModelView> {
    const services = await JSON.parse(await fs.readFile(path.join(__dirname, '../../data/aws-services.json'), 'utf-8'));
    return new AwsServiceModelView(services as AWSServiceList);
  }

  private readonly expanded = new Set<string>();
  private readonly services: AWSService[];
  private _currentFilter: string = '';

  constructor(services: AWSServiceList) {
    this.services = services.services;
  }

  public get currentFilter(): string {
    return this._currentFilter;
  }

  public setFilter(filter: string): void {
    this._currentFilter = filter;
  }

  public toggleExpanded(resourceHaver: AWSResourceHaver | string): void {
    const nodeId = typeof resourceHaver === 'string' ? resourceHaver : resourceHaver.nodeId;

    if (this.expanded.has(nodeId)) {
      this.expanded.delete(nodeId);
    } else {
      this.expanded.add(nodeId);
    }
  }

  public getNodeById(node: string, source: 'filtered' | 'all'): AWSResourceHaver | undefined {
    let ret: AWSResourceHaver | undefined;
    for (const service of source === 'filtered' ? this.filtered() : this.services) {
      recurse(service);
    }
    return ret;

    function recurse(resourceHaver: AWSResourceHaver) {
      if (resourceHaver.nodeId === node) {
        ret = resourceHaver;
        return;
      }

      for (const resource of resourceHaver.resources) {
        recurse(resource);
      }
    }
  }

  public getOperationById(id: string): { service: AWSService; operation: AWSOperation } | undefined {
    let ret: ReturnType<typeof this.getOperationById>;
    for (const service of this.services) {
      recurse(service, service);
    }
    return ret;

    function recurse(service: AWSService, resourceHaver: AWSResourceHaver) {
      for (const operation of resourceHaver.operations) {
        if (operation.operationId === id) {
          ret = { service, operation };
          return;
        }
      }

      for (const resource of resourceHaver.resources) {
        recurse(service, resource);
      }
    }
  }

  public isExpanded(resourceHaver: AWSResourceHaver): boolean {
    return this.expanded.has(resourceHaver.nodeId);
  }

  public filtered(): AWSService[] {
    if (this._currentFilter === '') {
      return this.services;
    }

    const self = this;

    return this.services
      .map(service => {
        const serviceHaystacks = [service.name, service.shortName];
        if (this.matches(serviceHaystacks)) {
          return service;
        }

        return {
          ...service,
          operations: service.operations.filter(op => matchingOperation(op, serviceHaystacks)),
          resources: service.resources.map(res => filterResourceMembers(res, serviceHaystacks)).filter(hasMembers),
        };
      }).filter(hasMembers);

    function matchingOperation(op: AWSOperation, parentStrings: string[]): boolean {
      const ret = self.matches([...parentStrings, op.name, op.description || '']);
      return ret;
    }

    function filterResourceMembers(resource: AWSResource, parentStrings: string[]): AWSResource {
      const resourceHaystacks = [...parentStrings, resource.name];
      if (self.matches(resourceHaystacks)) {
        return resource;
      }

      return {
        ...resource,
        operations: resource.operations.filter(op => matchingOperation(op, resourceHaystacks)),
        resources: resource.resources.map(res => filterResourceMembers(res, resourceHaystacks)).filter(hasMembers),
      };
    }
  }

  private matches(haystacks: string[]): boolean {
    return matches(this._currentFilter, haystacks);
  }
}

function hasMembers(x: AWSResource | AWSService): boolean {
  return x.operations.length > 0 || x.resources.length > 0;
}

function matches(needle: string, haystacks: string[]): boolean {
  const parts = needle.toLowerCase().split(/\s+/);
  haystacks = haystacks.map(x => x.toLowerCase());
  return parts.every(part => haystacks.some(hay => hay.includes(part)));
}
