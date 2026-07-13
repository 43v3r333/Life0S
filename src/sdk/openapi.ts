/**
 * Project Jannah v6.1 - 43v3r.SDK
 * Automated OpenAPI v3.0.3 Spec Generator Registry
 */

export interface OpenApiEndpoint {
  path: string;
  method: "get" | "post" | "put" | "delete" | "patch";
  summary: string;
  description: string;
  tags: string[];
  parameters?: {
    name: string;
    in: "query" | "path" | "header" | "cookie";
    required: boolean;
    schema: { type: string; enum?: string[]; default?: any };
    description?: string;
  }[];
  requestBodySchemaName?: string;
  responseSchemaName: string;
  securityRequired?: boolean;
}

export class OpenApiGenerator {
  private readonly _endpoints: OpenApiEndpoint[] = [];
  private readonly _schemas = new Map<string, any>();

  constructor() {
    this.registerDefaultSchemas();
  }

  public registerEndpoint(endpoint: OpenApiEndpoint): void {
    this._endpoints.push(endpoint);
    console.log(`[OPENAPI GENERATOR] Automatically mapped endpoint: [${endpoint.method.toUpperCase()}] ${endpoint.path}`);
  }

  public registerSchema(name: string, schema: any): void {
    this._schemas.set(name, schema);
  }

  public generateSpec(): Record<string, any> {
    const paths: Record<string, any> = {};

    for (const ep of this._endpoints) {
      if (!paths[ep.path]) {
        paths[ep.path] = {};
      }

      const parameters = ep.parameters?.map(p => ({
        name: p.name,
        in: p.in,
        required: p.required,
        description: p.description,
        schema: p.schema
      })) || [];

      const responses: Record<string, any> = {
        "200": {
          description: "Successful operation",
          content: {
            "application/json": {
              schema: {
                $ref: `#/components/schemas/${ep.responseSchemaName}`
              }
            }
          }
        },
        "400": {
          description: "Validation failure or domain invariant broken",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ProblemDetails"
              }
            }
          }
        }
      };

      if (ep.securityRequired) {
        responses["401"] = { description: "Unauthorized - missing correlation authentication" };
        responses["403"] = { description: "Forbidden - role clearance insufficient" };
      }

      const operation: any = {
        summary: ep.summary,
        description: ep.description,
        tags: ep.tags,
        parameters,
        responses
      };

      if (ep.requestBodySchemaName) {
        operation.requestBody = {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: `#/components/schemas/${ep.requestBodySchemaName}`
              }
            }
          }
        };
      }

      if (ep.securityRequired) {
        operation.security = [{ bearerAuth: [] }];
      }

      paths[ep.path][ep.method] = operation;
    }

    const schemasObj: Record<string, any> = {};
    for (const [name, schema] of this._schemas.entries()) {
      schemasObj[name] = schema;
    }

    return {
      openapi: "3.0.3",
      info: {
        title: "StrategyOS & Project Jannah Consolidated Gateway Node API",
        description: "Production-grade, auto-generated OpenAPI v3 schema defining commands and queries representing Phase 2 modules.",
        version: "6.1.0"
      },
      servers: [
        { url: "/api", description: "Consolidated Gateway Node API Base Route" }
      ],
      paths,
      components: {
        schemas: schemasObj,
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
          }
        }
      }
    };
  }

  private registerDefaultSchemas() {
    this.registerSchema("ProblemDetails", {
      type: "object",
      properties: {
        type: { type: "string", example: "https://projectjannah.io/errors/validation-failed" },
        title: { type: "string", example: "Command Validation Failed" },
        status: { type: "integer", example: 400 },
        detail: { type: "string", example: "The requested field 'title' is mandatory to provision an aggregate root." },
        errors: {
          type: "object",
          additionalProperties: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    this.registerSchema("EmptyResponse", {
      type: "object",
      properties: {
        success: { type: "boolean", example: true }
      }
    });
  }
}

export const openApiGenerator = new OpenApiGenerator();
export default openApiGenerator;
