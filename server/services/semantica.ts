import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';

/**
 * Semantica Service Wrapper
 *
 * This service provides a TypeScript interface to the Semantica knowledge engineering framework.
 * It spawns a Python subprocess to interact with Semantica's core functionality.
 */
export class SemanticaService {
  private pythonProcess: any = null;
  public isInitialized = false;
  private readonly pythonScriptPath: string;

  constructor() {
    // Path to the Python script that will interface with Semantica
    this.pythonScriptPath = join(__dirname, '..', '..', 'scripts', 'semantica_bridge.py');
  }

  /**
   * Initialize the Semantica service
   * Spawns a Python subprocess that loads the Semantica framework
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Create the Python bridge script if it doesn't exist
      await this.createBridgeScript();

      // Spawn Python process
      this.pythonProcess = spawn('python3', [this.pythonScriptPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Wait for initialization
      await new Promise<void>((resolve, reject) => {
        let initialized = false;
        let timeout = setTimeout(() => {
          reject(new Error('Semantica initialization timeout'));
        }, 10000);

        this.pythonProcess.stdout.on('data', (data: Buffer) => {
          const message = data.toString().trim();
          console.log(`[Semantica] ${message}`);

          if (message === 'SEMANTICA_READY') {
            clearTimeout(timeout);
            initialized = true;
            this.isInitialized = true;
            resolve();
          }
        });

        this.pythonProcess.stderr.on('data', (data: Buffer) => {
          console.error(`[Semantica Error] ${data.toString()}`);
        });

        this.pythonProcess.on('error', (err: Error) => {
          clearTimeout(timeout);
          reject(err);
        });

        this.pythonProcess.on('close', (code: number) => {
          clearTimeout(timeout);
          if (!initialized && code !== 0) {
            reject(new Error(`Semantica process exited with code ${code}`));
          }
        });
      });

      console.log('[Semantica] Service initialized successfully');
    } catch (error) {
      console.error('[Semantica] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Create the Python bridge script that interfaces with Semantica
   */
  private async createBridgeScript(): Promise<void> {
    const scriptDir = join(__dirname, '..', '..', 'scripts');
    const scriptContent = `
import sys
import json
import os
from pathlib import Path

# Add the Semantica package to Python path
semantica_path = os.path.join(os.path.dirname(__file__), '..', 'semantica')
if os.path.exists(semantica_path):
    sys.path.insert(0, semantica_path)
else:
    # Try to import from installed package
    pass

try:
    import semantica
    from semantica import Semantica, PipelineBuilder

    # Initialize Semantica instance
    semantica_instance = Semantica()

    # Signal readiness
    print("SEMANTICA_READY", flush=True)

    # Main message loop
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            request = json.loads(line)
            request_id = request.get('id')
            action = request.get('action')

            response = {
                'id': request_id,
                'success': False,
                'result': None,
                'error': None
            }

            if action == 'extract_triples':
                text = request.get('text', '')
                # Extract triples using Semantica
                # This is a simplified example - actual implementation would use Semantica's extractors
                triples = semantica_instance.extract_triples(text)
                response['success'] = True
                response['result'] = triples

            elif action == 'search_knowledge':
                query = request.get('query', '')
                # Search knowledge graph
                results = semantica_instance.search(query)
                response['success'] = True
                response['result'] = results

            elif action == 'add_triple':
                subject = request.get('subject')
                predicate = request.get('predicate')
                object = request.get('object')
                # Add triple to knowledge graph
                success = semantica_instance.add_triple(subject, predicate, object)
                response['success'] = True
                response['result'] = {'added': success}

            elif action == 'get_stats':
                # Get knowledge graph statistics
                stats = semantica_instance.get_stats()
                response['success'] = True
                response['result'] = stats

            else:
                response['error'] = f'Unknown action: {action}'

        except json.JSONDecodeError:
            response['error'] = 'Invalid JSON request'
        except Exception as e:
            response['error'] = str(e)
            response['success'] = False

        print(json.dumps(response), flush=True)

except ImportError as e:
    # Fallback implementation when Semantica is not available
    print(f"SEMANTICA_READY_FALLBACK: {str(e)}", flush=True)

    # Simple fallback responses
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            request = json.loads(line)
            request_id = request.get('id')
            action = request.get('action')

            response = {
                'id': request_id,
                'success': True,
                'result': None,
                'error': None
            }

            if action == 'extract_triples':
                # Simple fallback extraction
                text = request.get('text', '')
                # Return empty triples as fallback
                response['result'] = []

            elif action == 'search_knowledge':
                query = request.get('query', '')
                # Return empty results as fallback
                response['result'] = []

            elif action == 'add_triple':
                response['result'] = {'added': False, 'fallback': True}

            elif action == 'get_stats':
                response['result'] = {
                    'triples': 0,
                    'entities': 0,
                    'fallback': True
                }

            else:
                response['error'] = f'Unknown action: {action}'
                response['success'] = False

        except json.JSONDecodeError:
            response['error'] = 'Invalid JSON request'
        except Exception as e:
            response['error'] = str(e)
            response['success'] = False

        print(json.dumps(response), flush=True)
`;


    // Ensure scripts directory exists
    const scriptsDir = join(__dirname, '..', '..', 'scripts');
    if (!existsSync(scriptsDir)) {
      await mkdir(scriptsDir, { recursive: true });
    }

    // Write the bridge script
    await writeFile(this.pythonScriptPath, scriptContent.trim(), 'utf8');
    console.log(`[Semantica] Bridge script created at ${this.pythonScriptPath}`);
  }

  /**
   * Extract triples from text using Semantica
   */
  async extractTriples(text: string): Promise<any[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.pythonProcess) {
        reject(new Error('Semantica process not available'));
        return;
      }

      const request = {
        id: Math.random().toString(36).substr(2, 9),
        action: 'extract_triples',
        text: text
      };

      // Handle response
      const handleResponse = (data: Buffer) => {
        try {
          const response = JSON.parse(data.toString().trim());
          if (response.id === request.id) {
            // Remove listener
            this.pythonProcess.stdout.removeListener('data', handleResponse);

            if (response.success) {
              resolve(response.result || []);
            } else {
              reject(new Error(response.error || 'Unknown error'));
            }
          }
        } catch (err) {
          reject(err);
        }
      };

      this.pythonProcess.stdout.once('data', handleResponse);
      this.pythonProcess.stdin.write(JSON.stringify(request) + '\\n');
    });
  }

  /**
   * Search the knowledge graph
   */
  async searchKnowledge(query: string): Promise<any[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.pythonProcess) {
        reject(new Error('Semantica process not available'));
        return;
      }

      const request = {
        id: Math.random().toString(36).substr(2, 9),
        action: 'search_knowledge',
        query: query
      };

      const handleResponse = (data: Buffer) => {
        try {
          const response = JSON.parse(data.toString().trim());
          if (response.id === request.id) {
            this.pythonProcess.stdout.removeListener('data', handleResponse);

            if (response.success) {
              resolve(response.result || []);
            } else {
              reject(new Error(response.error || 'Unknown error'));
            }
          }
        } catch (err) {
          reject(err);
        }
      };

      this.pythonProcess.stdout.once('data', handleResponse);
      this.pythonProcess.stdin.write(JSON.stringify(request) + '\\n');
    });
  }

  /**
   * Add a triple to the knowledge graph
   */
  async addTriple(subject: string, predicate: string, object: string): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.pythonProcess) {
        reject(new Error('Semantica process not available'));
        return;
      }

      const request = {
        id: Math.random().toString(36).substr(2, 9),
        action: 'add_triple',
        subject: subject,
        predicate: predicate,
        object: object
      };

      const handleResponse = (data: Buffer) => {
        try {
          const response = JSON.parse(data.toString().trim());
          if (response.id === request.id) {
            this.pythonProcess.stdout.removeListener('data', handleResponse);

            if (response.success) {
              resolve(response.result?.added || false);
            } else {
              reject(new Error(response.error || 'Unknown error'));
            }
          }
        } catch (err) {
          reject(err);
        }
      };

      this.pythonProcess.stdout.once('data', handleResponse);
      this.pythonProcess.stdin.write(JSON.stringify(request) + '\\n');
    });
  }

  /**
   * Get knowledge graph statistics
   */
  async getStats(): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.pythonProcess) {
        reject(new Error('Semantica process not available'));
        return;
      }

      const request = {
        id: Math.random().toString(36).substr(2, 9),
        action: 'get_stats'
      };

      const handleResponse = (data: Buffer) => {
        try {
          const response = JSON.parse(data.toString().trim());
          if (response.id === request.id) {
            this.pythonProcess.stdout.removeListener('data', handleResponse);

            if (response.success) {
              resolve(response.result || {});
            } else {
              reject(new Error(response.error || 'Unknown error'));
            }
          }
        } catch (err) {
          reject(err);
        }
      };

      this.pythonProcess.stdout.once('data', handleResponse);
      this.pythonProcess.stdin.write(JSON.stringify(request) + '\\n');
    });
  }

  /**
   * Shutdown the Semantica service
   */
  async shutdown(): Promise<void> {
    if (this.pythonProcess) {
      this.pythonProcess.stdin.end();
      this.pythonProcess.kill();
      this.pythonProcess = null;
      this.isInitialized = false;
      console.log('[Semantica] Service shutdown');
    }
  }
}

// Export a singleton instance
export const semanticaService = new SemanticaService();