import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  NodeTypes,
  Connection,
  Panel,
  useReactFlow,
  ReactFlowProvider as ReactFlowProviderComponent,
  MiniMap,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from './ui/button';
import { Download, Maximize2, Minimize2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { NotebookSlide } from '../types';
interface MindMapNode {
  id: string;
  type?: string;
  data: {
    label: string;
    isRoot?: boolean;
  };
  position: { x: number; y: number };
  style?: React.CSSProperties;
}
interface MindMapProps {
  slides: NotebookSlide[];
  summary: string;
}
const MindMap: React.FC<MindMapProps> = ({ slides, summary }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<MindMapNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { fitView } = useReactFlow();
  // Set up dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (reactFlowWrapper.current) {
        const { width, height } = reactFlowWrapper.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  // Initialize mindmap with data
  useEffect(() => {
    if (slides.length === 0) return;
    const initialNodes: MindMapNode[] = [];
    const initialEdges: Edge[] = [];
    // Add root node (summary)
    initialNodes.push({
      id: 'root',
      data: { 
        label: summary.length > 100 ? `${summary.substring(0, 100)}...` : summary,
        isRoot: true 
      },
      position: { x: dimensions.width / 2, y: 50 },
      style: {
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: 'white',
        border: '2px solid #4f46e5',
        borderRadius: '8px',
        padding: '10px 15px',
        width: 300,
        textAlign: 'center',
        fontWeight: 'bold',
      },
    });
    // Add slide nodes
    slides.forEach((slide, index) => {
      const angle = (index / slides.length) * Math.PI * 2;
      const radius = 200;
      const x = dimensions.width / 2 + Math.cos(angle) * radius - 150;
      const y = 200 + Math.sin(angle) * radius;
      initialNodes.push({
        id: `slide-${index}`,
        data: { 
          label: slide.title,
          isRoot: false 
        },
        position: { x, y },
        style: {
          background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
          color: 'white',
          border: '2px solid #db2777',
          borderRadius: '6px',
          padding: '8px 12px',
          width: 200,
          textAlign: 'center',
        },
      });
      // Connect to root
      initialEdges.push({
        id: `edge-${index}`,
        source: 'root',
        target: `slide-${index}`,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#9ca3af',
        },
        style: {
          stroke: '#9ca3af',
          strokeWidth: 2,
        },
      });
      // Add points as child nodes
      slide.points.forEach((point, pointIndex) => {
        const pointId = `point-${index}-${pointIndex}`;
        const pointAngle = angle + ((pointIndex - (slide.points.length - 1) / 2) * 0.5) / slides.length;
        const pointX = x + Math.cos(pointAngle) * 180;
        const pointY = y + 100 + Math.sin(pointAngle) * 80;
        initialNodes.push({
          id: pointId,
          data: { 
            label: point,
            isRoot: false 
          },
          position: { x: pointX, y: pointY },
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            padding: '6px 10px',
            width: 180,
            fontSize: '0.875rem',
          },
        });
        // Connect to slide
        initialEdges.push({
          id: `edge-${index}-${pointIndex}`,
          source: `slide-${index}`,
          target: pointId,
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#d1d5db',
          },
          style: {
            stroke: '#d1d5db',
            strokeWidth: 1.5,
          },
        });
      });
    });
    setNodes(initialNodes);
    setEdges(initialEdges);
    // Fit view after a short delay to allow the nodes to be rendered
    setTimeout(() => {
      fitView({ padding: 0.2 });
    }, 100);
  }, [slides, summary, dimensions, fitView]);
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  const onInit = (rfi: any) => {
    setReactFlowInstance(rfi);
  };
  const handleDownload = async () => {
    if (!reactFlowInstance) return;
    const toastId = toast.loading('Exporting mindmap...');
    try {
      // Wait for the next frame to ensure all nodes are rendered
      await new Promise(resolve => requestAnimationFrame(resolve));
      const flow = reactFlowInstance.toObject();
      const blob = new Blob([JSON.stringify(flow, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'neurolearn-mindmap.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Mindmap exported successfully!', { id: toastId });
    } catch (error) {
      console.error('Error exporting mindmap:', error);
      toast.error('Failed to export mindmap', { id: toastId });
    }
  };
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      fitView({ padding: 0.2 });
    }, 100);
  };
  return (
    <div 
      ref={reactFlowWrapper} 
      className={`relative bg-gray-50 dark:bg-gray-900 rounded-lg border border-border overflow-hidden transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 m-0' : 'h-[600px]'}`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        fitView
        attributionPosition="bottom-left"
        nodeTypes={{
          default: ({ data }) => (
            <div 
              className={`px-4 py-2 rounded-md shadow-sm ${data.isRoot ? 'text-white font-bold' : 'bg-white dark:bg-gray-800'}`}
              style={data.isRoot ? {} : { border: '1px solid #e5e7eb' }}
            >
              {data.label}
            </div>
          ),
        }}
      >
        <Background />
        <Controls />
        <MiniMap zoomable pannable />
        <Panel position="top-right" className="flex gap-2">
          <Button 
            onClick={handleDownload} 
            variant="outline" 
            size="sm"
            className="bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={toggleFullscreen} 
            variant="outline" 
            size="sm"
            className="bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-700"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 mr-2" />
            ) : (
              <Maximize2 className="w-4 h-4 mr-2" />
            )}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};
// Wrapper component to provide ReactFlow context
const MindMapWrapper: React.FC<MindMapProps> = (props) => (
  <ReactFlowProviderComponent>
    <MindMap {...props} />
  </ReactFlowProviderComponent>
);
export default MindMapWrapper;
