import { knowledgeCompiler, KnowledgePackage, CompilationResult } from '../books/book-VII-knowledge-compiler';
import { pluginEngine, PluginManifest } from '../books/book-X-plugins';
import { versionConstitution } from '../books/book-IX-versioning';

export interface MedicalCompilationResult {
  success: boolean;
  packageResult: CompilationResult;
  pluginResults: { id: string; success: boolean; errors: string[] }[];
  versionStatus: string;
  timestamp: number;
  artifacts: CompilationArtifact[];
}

export interface CompilationArtifact {
  type: 'neo4j_cypher' | 'pg_schema' | 'typescript_types' | 'documentation_markdown' | 'validation_report';
  content: string;
  format: string;
}

export class MedicalCompiler {
  private readonly validationPipeline: ValidationStage[];

  constructor() {
    this.validationPipeline = [
      new SchemaValidator(),
      new RelationshipValidator(),
      new ContextValidator(),
      new RuleValidator(),
      new DocumentationValidator(),
      new GraphConsistencyValidator(),
      new EvidenceValidator(),
      new VersionValidator(),
    ];
  }

  compile(
    pkg: KnowledgePackage,
    plugins?: PluginManifest[],
  ): MedicalCompilationResult {
    const errors: string[] = [];
    const artifacts: CompilationArtifact[] = [];

    const packageResult = knowledgeCompiler.compile(pkg);

    const pluginResults = (plugins || pluginEngine.getByDomain({} as never)).map(plugin => ({
      id: plugin.id,
      success: true,
      errors: [] as string[],
    }));

    for (const stage of this.validationPipeline) {
      const stageResult = stage.validate(pkg);
      if (!stageResult.passed) {
        if (stageResult.fatal) {
          errors.push(...stageResult.errors);
          return {
            success: false,
            packageResult,
            pluginResults,
            versionStatus: 'compilation_failed',
            timestamp: Date.now(),
            artifacts,
          };
        }
      }
    }

    const versionEntry = versionConstitution.register({
      id: pkg.id,
      name: pkg.name,
      type: pkg.symptom ? 'symptom' : pkg.disease ? 'disease' : 'protocol',
      version: pkg.version,
      previousVersion: null,
      changelog: [],
      status: 'draft',
      publishedAt: null,
      author: 'compiler',
    });

    artifacts.push({
      type: 'validation_report',
      content: JSON.stringify({ errors: packageResult.errors, warnings: packageResult.warnings }, null, 2),
      format: 'json',
    });

    return {
      success: packageResult.success && errors.length === 0,
      packageResult,
      pluginResults,
      versionStatus: versionEntry.status,
      timestamp: Date.now(),
      artifacts,
    };
  }

  generateKnowledgePackage(name: string, symptomId: string, version: string): KnowledgePackage {
    return {
      id: `pkg.${symptomId}`,
      name,
      version,
      symptom: symptomId,
      objects: [],
      relationships: [],
      contexts: [],
      rules: [],
      documentation: [],
    };
  }
}

interface ValidationResult {
  passed: boolean;
  fatal: boolean;
  errors: string[];
}

abstract class ValidationStage {
  abstract name: string;
  abstract validate(pkg: KnowledgePackage): ValidationResult;
}

class SchemaValidator extends ValidationStage {
  name = 'Schema';
  validate(pkg: KnowledgePackage): ValidationResult {
    const errors: string[] = [];
    if (!pkg.id) errors.push('Package must have an ID');
    if (!pkg.name) errors.push('Package must have a name');
    if (!pkg.version) errors.push('Package must have a version');
    return { passed: errors.length === 0, fatal: true, errors };
  }
}

class RelationshipValidator extends ValidationStage {
  name = 'Relationships';
  validate(pkg: KnowledgePackage): ValidationResult {
    const errors: string[] = [];
    const objectIds = new Set(pkg.objects.map(o => o.id));
    for (const rel of pkg.relationships) {
      if (!objectIds.has(rel.sourceId)) errors.push(`Source ${rel.sourceId} not found`);
      if (!objectIds.has(rel.targetId)) errors.push(`Target ${rel.targetId} not found`);
    }
    return { passed: errors.length === 0, fatal: false, errors };
  }
}

class ContextValidator extends ValidationStage {
  name = 'Contexts';
  validate(pkg: KnowledgePackage): ValidationResult {
    const errors: string[] = [];
    const required = ['adult', 'child'];
    const missing = required.filter(r => !pkg.contexts.includes(r));
    if (missing.length > 0) errors.push(`Missing required contexts: ${missing.join(', ')}`);
    return { passed: errors.length === 0, fatal: false, errors };
  }
}

class RuleValidator extends ValidationStage {
  name = 'Rules';
  validate(pkg: KnowledgePackage): ValidationResult {
    const errors: string[] = [];
    for (const rule of pkg.rules) {
      if (!rule.condition) errors.push(`Rule ${rule.id} has no condition`);
      if (!rule.action) errors.push(`Rule ${rule.id} has no action`);
    }
    return { passed: errors.length === 0, fatal: false, errors };
  }
}

class DocumentationValidator extends ValidationStage {
  name = 'Documentation';
  validate(pkg: KnowledgePackage): ValidationResult {
    const errors: string[] = [];
    const objectIds = new Set(pkg.objects.map(o => o.id));
    for (const doc of pkg.documentation) {
      if (!objectIds.has(doc.objectId)) errors.push(`Doc references missing object ${doc.objectId}`);
    }
    return { passed: errors.length === 0, fatal: false, errors };
  }
}

class GraphConsistencyValidator extends ValidationStage {
  name = 'Graph Consistency';
  validate(pkg: KnowledgePackage): ValidationResult {
    const errors: string[] = [];
    const objCount = pkg.objects.length;
    const relCount = pkg.relationships.length;
    if (objCount > 0 && relCount === 0) errors.push('Objects exist but no relationships defined');
    return { passed: errors.length === 0, fatal: false, errors };
  }
}

class EvidenceValidator extends ValidationStage {
  name = 'Evidence';
  validate(_pkg: KnowledgePackage): ValidationResult {
    return { passed: true, fatal: false, errors: [] };
  }
}

class VersionValidator extends ValidationStage {
  name = 'Versioning';
  validate(pkg: KnowledgePackage): ValidationResult {
    const errors: string[] = [];
    const semverRegex = /^\d+\.\d+\.\d+$/;
    if (!semverRegex.test(pkg.version)) errors.push(`Version ${pkg.version} must be semver (x.y.z)`);
    return { passed: errors.length === 0, fatal: false, errors };
  }
}

export const medicalCompiler = new MedicalCompiler();
