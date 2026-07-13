using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace LifeOS.Domain.Kernel
{
    public enum NodeType
    {
        Person,
        Goal,
        Habit,
        Prayer,
        Quran,
        Project,
        Task,
        Company,
        Business,
        Meeting,
        Book,
        Course,
        Expense,
        Investment,
        Marriage,
        Child,
        Event,
        Journal,
        Knowledge
    }

    public enum RelationshipType
    {
        Owns,
        MarriedTo,
        Supports,
        DependsOn,
        WorksFor,
        Created,
        Reads,
        Learns,
        Completed,
        Funds,
        Scheduled,
        Participated,
        ConnectedTo
    }

    /// <summary>
    /// Represents a single vertex in the LifeOS Relational Life Graph.
    /// </summary>
    public class GraphNode
    {
        public Guid Id { get; } = Guid.NewGuid();
        public NodeType Type { get; set; }
        public string Name { get; set; } = string.Empty;
        public Dictionary<string, string> Properties { get; } = new();

        public GraphNode(NodeType type, string name)
        {
            Type = type;
            Name = name ?? throw new ArgumentNullException(nameof(name));
        }
    }

    /// <summary>
    /// Represents a directed link connecting two vertices with a strict relationship type.
    /// </summary>
    public class GraphEdge
    {
        public Guid SourceId { get; set; }
        public Guid TargetId { get; set; }
        public RelationshipType Relation { get; set; }
        public Dictionary<string, string> Attributes { get; } = new();

        public GraphEdge(Guid sourceId, Guid targetId, RelationshipType relation)
        {
            SourceId = sourceId;
            TargetId = targetId;
            Relation = relation;
        }
    }

    /// <summary>
    /// Traversal engine implementing search algorithms (BFS / DFS) on our graph topology.
    /// </summary>
    public class GraphTraversal
    {
        private readonly GraphEngine _engine;

        public GraphTraversal(GraphEngine engine)
        {
            _engine = engine ?? throw new ArgumentNullException(nameof(engine));
        }

        public List<GraphNode> GetTransitiveDependencies(Guid startNodeId)
        {
            var dependencies = new List<GraphNode>();
            var visited = new HashSet<Guid>();
            var queue = new Queue<Guid>();

            queue.Enqueue(startNodeId);
            visited.Add(startNodeId);

            while (queue.Count > 0)
            {
                var currentId = queue.Dequeue();
                var outgoingEdges = _engine.GetEdges(currentId)
                    .Where(e => e.Relation == RelationshipType.DependsOn || e.Relation == RelationshipType.Supports);

                foreach (var edge in outgoingEdges)
                {
                    if (!visited.Contains(edge.TargetId))
                    {
                        visited.Add(edge.TargetId);
                        queue.Enqueue(edge.TargetId);
                        if (_engine.TryGetNode(edge.TargetId, out var node))
                        {
                            dependencies.Add(node);
                        }
                    }
                }
            }

            return dependencies;
        }
    }

    /// <summary>
    /// Direct query utility searching nodes based on types or attributes.
    /// </summary>
    public class GraphQueries
    {
        private readonly GraphEngine _engine;

        public GraphQueries(GraphEngine engine)
        {
            _engine = engine ?? throw new ArgumentNullException(nameof(engine));
        }

        public IEnumerable<GraphNode> FindNodesByType(NodeType type)
        {
            return _engine.Nodes.Where(n => n.Type == type);
        }

        public IEnumerable<GraphNode> FindConnectedNodes(Guid nodeId, RelationshipType relation)
        {
            var targetIds = _engine.GetEdges(nodeId)
                .Where(e => e.Relation == relation)
                .Select(e => e.TargetId);

            return _engine.Nodes.Where(n => targetIds.Contains(n.Id));
        }
    }

    /// <summary>
    /// Indexer maintaining fast lookup maps.
    /// </summary>
    public class GraphIndexer
    {
        private readonly ConcurrentDictionary<string, List<Guid>> _typeIndex = new();

        public void IndexNode(GraphNode node)
        {
            string key = node.Type.ToString();
            var list = _typeIndex.GetOrAdd(key, _ => new List<Guid>());
            lock (list)
            {
                if (!list.Contains(node.Id))
                {
                    list.Add(node.Id);
                }
            }
        }

        public void UnindexNode(GraphNode node)
        {
            string key = node.Type.ToString();
            if (_typeIndex.TryGetValue(key, out var list))
            {
                lock (list)
                {
                    list.Remove(node.Id);
                }
            }
        }
    }

    /// <summary>
    /// Rules engine validating relational structures, ensuring cycles or invalid relationships aren't written.
    /// </summary>
    public class RelationshipManager
    {
        private readonly GraphEngine _engine;

        public RelationshipManager(GraphEngine engine)
        {
            _engine = engine ?? throw new ArgumentNullException(nameof(engine));
        }

        public bool ValidateAndAddRelationship(Guid sourceId, Guid targetId, RelationshipType relation)
        {
            if (!_engine.TryGetNode(sourceId, out var source) || !_engine.TryGetNode(targetId, out var target))
            {
                return false; // Nodes do not exist
            }

            // Relationship Invariant Rule: A Goal cannot DependOn itself (direct cycle check)
            if (relation == RelationshipType.DependsOn && sourceId == targetId)
            {
                return false;
            }

            // Relationship Invariant Rule: Marriage must link Person to Person
            if (relation == RelationshipType.MarriedTo && (source.Type != NodeType.Person || target.Type != NodeType.Person))
            {
                return false;
            }

            _engine.AddEdge(sourceId, targetId, relation);
            return true;
        }
    }

    /// <summary>
    /// Central operational graph database.
    /// </summary>
    public class GraphEngine
    {
        private readonly ConcurrentDictionary<Guid, GraphNode> _nodes = new();
        private readonly ConcurrentBag<GraphEdge> _edges = new();
        
        public GraphTraversal Traversal { get; }
        public GraphQueries Queries { get; }
        public GraphIndexer Indexer { get; }
        public RelationshipManager Relationship { get; }

        public IEnumerable<GraphNode> Nodes => _nodes.Values;
        public IEnumerable<GraphEdge> Edges => _edges;

        public GraphEngine()
        {
            Traversal = new GraphTraversal(this);
            Queries = new GraphQueries(this);
            Indexer = new GraphIndexer();
            Relationship = new RelationshipManager(this);
        }

        public void AddNode(GraphNode node)
        {
            if (node == null) throw new ArgumentNullException(nameof(node));
            _nodes[node.Id] = node;
            Indexer.IndexNode(node);
        }

        public bool TryGetNode(Guid id, out GraphNode node)
        {
            return _nodes.TryGetValue(id, out node);
        }

        public void AddEdge(Guid sourceId, Guid targetId, RelationshipType relation)
        {
            _edges.Add(new GraphEdge(sourceId, targetId, relation));
        }

        public IEnumerable<GraphEdge> GetEdges(Guid sourceId)
        {
            return _edges.Where(e => e.SourceId == sourceId);
        }

        public void Clear()
        {
            _nodes.Clear();
            // ConcurrentBag can only be cleared by exhausting it
            while (_edges.TryTake(out _)) { }
        }
    }
}
