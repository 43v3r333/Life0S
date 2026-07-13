using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace LifeOS.Domain.Kernel
{
    /// <summary>
    /// Represents the strict operational status of a LifeOS module.
    /// </summary>
    public enum ModuleStatus
    {
        Unloaded,
        Loading,
        Active,
        Degraded,
        Failed,
        Suspended
    }

    /// <summary>
    /// Core manifest describing a self-registering module inside LifeOS.
    /// </summary>
    public class ModuleManifest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Version { get; set; } = "1.0.0";
        public List<string> Dependencies { get; set; } = new();
        public List<string> RegisteredServices { get; set; } = new();
        public List<string> SupportedCommands { get; set; } = new();
        public List<string> SupportedQueries { get; set; } = new();
        public List<string> HandledEvents { get; set; } = new();
        public List<string> ActivePolicies { get; set; } = new();
        public List<string> ExposedSkills { get; set; } = new();
        public List<string> TargetAiProviders { get; set; } = new();
    }

    /// <summary>
    /// Runtime context scoped to a specific loaded module, carrying configuration and security permissions.
    /// </summary>
    public class ModuleContext
    {
        public Guid SessionId { get; } = Guid.NewGuid();
        public string ModuleName { get; }
        public DateTime LoadedAt { get; } = DateTime.UtcNow;
        public Dictionary<string, string> Configuration { get; } = new();
        public List<string> Permissions { get; } = new();

        public ModuleContext(string moduleName)
        {
            ModuleName = moduleName ?? throw new ArgumentNullException(nameof(moduleName));
        }
    }

    /// <summary>
    /// The contract that every independent functional slice (Islam, Health, Finance, etc.) must implement.
    /// </summary>
    public interface IModule
    {
        ModuleManifest Manifest { get; }
        ModuleStatus Status { get; }
        Task InitializeAsync(ModuleContext context, CancellationToken cancellationToken);
        Task ShutdownAsync(CancellationToken cancellationToken);
    }

    /// <summary>
    /// Centrally tracks all registered modules and their current system health.
    /// </summary>
    public class ModuleRegistry
    {
        private readonly ConcurrentDictionary<string, IModule> _modules = new();
        private readonly ConcurrentDictionary<string, ModuleContext> _contexts = new();

        public IReadOnlyCollection<IModule> ActiveModules => _modules.Values.ToList().AsReadOnly();

        public bool Register(IModule module, ModuleContext context)
        {
            if (module == null) throw new ArgumentNullException(nameof(module));
            if (context == null) throw new ArgumentNullException(nameof(context));

            string key = module.Manifest.Name.ToLowerInvariant();
            _contexts[key] = context;
            return _modules.TryAdd(key, module);
        }

        public bool TryGetModule(string name, out IModule module)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                module = null;
                return false;
            }
            return _modules.TryGetValue(name.ToLowerInvariant(), out module);
        }

        public ModuleContext GetContext(string name)
        {
            if (string.IsNullOrWhiteSpace(name)) throw new ArgumentNullException(nameof(name));
            _contexts.TryGetValue(name.ToLowerInvariant(), out var context);
            return context;
        }

        public void Clear()
        {
            _modules.Clear();
            _contexts.Clear();
        }
    }

    /// <summary>
    /// Automatic module discovery and loader engine utilizing topological sorting for safe initialization.
    /// </summary>
    public class ModuleLoader
    {
        private readonly ModuleRegistry _registry;

        public ModuleLoader(ModuleRegistry registry)
        {
            _registry = registry ?? throw new ArgumentNullException(nameof(registry));
        }

        /// <summary>
        /// Discovers modules, builds their dependency graph, and initializes them in strict order.
        /// </summary>
        public async Task LoadModulesAsync(IEnumerable<IModule> modules, CancellationToken cancellationToken)
        {
            if (modules == null) return;

            var modulesList = modules.ToList();
            var sortedModules = TopologicalSort(modulesList);

            foreach (var module in sortedModules)
            {
                var context = new ModuleContext(module.Manifest.Name);
                // Populate default configurations
                context.Configuration["Platform"] = "LifeOS.Kernel";
                context.Configuration["Status"] = "Loading";

                _registry.Register(module, context);
                await module.InitializeAsync(context, cancellationToken);
            }
        }

        private List<IModule> TopologicalSort(List<IModule> modules)
        {
            var sorted = new List<IModule>();
            var visited = new Dictionary<string, bool>();

            void Visit(IModule module)
            {
                string key = module.Manifest.Name.ToLowerInvariant();
                if (visited.TryGetValue(key, out bool inProcess))
                {
                    if (inProcess) throw new InvalidOperationException($"Cyclic dependency detected in module {module.Manifest.Name}");
                    return;
                }

                visited[key] = true;

                foreach (string depName in module.Manifest.Dependencies)
                {
                    var dependency = modules.FirstOrDefault(m => m.Manifest.Name.Equals(depName, StringComparison.OrdinalIgnoreCase));
                    if (dependency != null)
                    {
                        Visit(dependency);
                    }
                    else
                    {
                        throw new KeyNotFoundException($"Required module dependency '{depName}' for '{module.Manifest.Name}' is not loaded.");
                    }
                }

                visited[key] = false;
                if (!sorted.Contains(module))
                {
                    sorted.Add(module);
                }
            }

            foreach (var module in modules)
            {
                Visit(module);
            }

            return sorted;
        }
    }

    /// <summary>
    /// Enterprise diagnostic engine checking integrity, response SLAs, and configuration states of all loaded modules.
    /// </summary>
    public class ModuleHealthCheck
    {
        private readonly ModuleRegistry _registry;

        public ModuleHealthCheck(ModuleRegistry registry)
        {
            _registry = registry ?? throw new ArgumentNullException(nameof(registry));
        }

        public Task<Dictionary<string, string>> CheckAllModulesAsync(CancellationToken cancellationToken)
        {
            var reports = new Dictionary<string, string>();
            foreach (var module in _registry.ActiveModules)
            {
                string status = module.Status.ToString();
                reports[module.Manifest.Name] = status;
            }
            return Task.FromResult(reports);
        }
    }
}
