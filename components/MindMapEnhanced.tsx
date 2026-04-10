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
import { Download, Maximize2, Minimize2, FileImage, FileText, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { NotebookSlide } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface MindMapNode {
  id: string;
  type?: string;
  data: {
    label: string;
    isRoot?: boolean;
    level?: number;
    category?: string;
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
  const [showExportDialog, setShowExportDialog] = useState(false);
  const { fitView } = useReactFlow();

  // Color schemes for different levels
  const colorSchemes = {
    root: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: '#667eea',
      textColor: '#ffffff',
    },
    level1: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      border: '#f093fb',
      textColor: '#ffffff',
    },
    level2: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      border: '#4facfe',
      textColor: '#ffffff',
    },
    level3: {
      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      border: '#43e97b',
      textColor: '#ffffff',
    },
  };

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

  // Initialize mindmap with enhanced layout
  useEffect(() => {
    if (slides.length === 0) return;
    const initialNodes: MindMapNode[] = [];
    const initialEdges: Edge[] = [];

    // Add root node (summary) with enhanced styling
    initialNodes.push({
      id: 'root',
      data: {
        label: summary.length > 150 ? `${summary.substring(0, 150)}...` : summary,
        isRoot: true,
        level: 0,
      },
      position: { x: dimensions.width / 2 - 200, y: 50 },
      style: {
        background: colorSchemes.root.background,
        color: colorSchemes.root.textColor,
        border: `3px solid ${colorSchemes.root.border}`,
        borderRadius: '16px',
        padding: '20px',
        width: 400,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '16px',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
        zIndex: 10,
      },
    });

    // Add slide nodes in a circular layout with enhanced styling
    const level1Radius = 250;
    const level2Radius = 180;

    slides.forEach((slide, index) => {
      const angle = (index / slides.length) * Math.PI * 2 - Math.PI / 2;
      const x = dimensions.width / 2 + Math.cos(angle) * level1Radius - 150;
      const y = 250 + Math.sin(angle) * level1Radius;

      // Add slide node
      initialNodes.push({
        id: `slide-${index}`,
        data: {
          label: slide.title,
          isRoot: false,
          level: 1,
          category: 'slide',
        },
        position: { x, y },
        style: {
          background: colorSchemes.level1.background,
          color: colorSchemes.level1.textColor,
          border: `2px solid ${colorSchemes.level1.border}`,
          borderRadius: '12px',
          padding: '15px',
          width: 300,
          textAlign: 'center',
          fontWeight: '600',
          fontSize: '14px',
          boxShadow: '0 8px 20px rgba(240, 147, 251, 0.3)',
          zIndex: 5,
        },
      });

      // Connect to root with enhanced edge
      initialEdges.push({
        id: `edge-${index}`,
        source: 'root',
        target: `slide-${index}`,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: colorSchemes.level1.border,
          width: 20,
          height: 20,
        },
        style: {
          stroke: colorSchemes.level1.border,
          strokeWidth: 3,
          boxShadow: '0 2px 8px rgba(240, 147, 251, 0.2)',
        },
      });

      // Add points as child nodes with enhanced layout
      slide.points.forEach((point, pointIndex) => {
        const pointAngle = angle + ((pointIndex - (slide.points.length - 1) / 2) * 0.3) / slides.length;
        const pointX = x + Math.cos(pointAngle) * level2Radius;
        const pointY = y + 150 + Math.sin(pointAngle) * 100;
        const pointId = `point-${index}-${pointIndex}`;

        initialNodes.push({
          id: pointId,
          data: {
            label: point,
            isRoot: false,
            level: 2,
            category: 'point',
          },
          position: { x: pointX, y: pointY },
          style: {
            background: colorSchemes.level2.background,
            color: colorSchemes.level2.textColor,
            border: `2px solid ${colorSchemes.level2.border}`,
            borderRadius: '8px',
            padding: '10px',
            width: 220,
            fontSize: '12px',
            boxShadow: '0 4px 12px rgba(79, 172, 254, 0.2)',
            zIndex: 1,
          },
        });

        // Connect point to slide with enhanced edge
        initialEdges.push({
          id: `edge-${index}-${pointIndex}`,
          source: `slide-${index}`,
          target: pointId,
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: colorSchemes.level2.border,
            width: 15,
            height: 15,
          },
          style: {
            stroke: colorSchemes.level2.border,
            strokeWidth: 2,
            boxShadow: '0 1px 4px rgba(79, 172, 254, 0.2)',
          },
        });
      });
    });

    setNodes(initialNodes);
    setEdges(initialEdges);

    // Fit view after a short delay
    setTimeout(() => {
      fitView({ padding: 0.15, duration: 800 });
    }, 100);
  }, [slides, summary, dimensions, fitView]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onInit = (rfi: any) => {
    setReactFlowInstance(rfi);
  };

  // Enhanced export functions
  const exportAsImage = async () => {
    if (!reactFlowWrapper.current) return;
    const toastId = toast.loading('Generating image...');
    try {
      const canvas = await html2canvas(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'NeuroLearn-mindmap.png';
      link.click();
      toast.success('Image exported successfully!', { id: toastId });
    } catch (error) {
      console.error('Error exporting image:', error);
      toast.error('Failed to export image', { id: toastId });
    }
    setShowExportDialog(false);
  };

  const exportAsPDF = async () => {
    if (!reactFlowWrapper.current) return;
    const toastId = toast.loading('Generating PDF...');
    try {
      const canvas = await html2canvas(reactFlowWrapper.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('NeuroLearn-mindmap.pdf');
      toast.success('PDF exported successfully!', { id: toastId });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF', { id: toastId });
    }
    setShowExportDialog(false);
  };

  const exportAsJSON = async () => {
    if (!reactFlowInstance) return;
    const toastId = toast.loading('Exporting JSON...');
    try {
      const flow = reactFlowInstance.toObject();
      const blob = new Blob([JSON.stringify(flow, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'NeuroLearn-mindmap.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('JSON exported successfully!', { id: toastId });
    } catch (error) {
      console.error('Error exporting JSON:', error);
      toast.error('Failed to export JSON', { id: toastId });
    }
    setShowExportDialog(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      fitView({ padding: 0.15, duration: 800 });
    }, 100);
  };

  // Enhanced custom node component
  const CustomNode = ({ data }: { data: any }) => {
    const level = data.level || 0;
    const colors = level === 0 ? colorSchemes.root :
      level === 1 ? colorSchemes.level1 :
        colorSchemes.level2;

    return (
      <div
        className={`px-4 py-3 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${data.isRoot ? 'text-white font-bold' : 'text-white font-semibold'
          }`}
        style={{
          background: colors.background,
          border: `2px solid ${colors.border}`,
          color: colors.textColor,
          boxShadow: `0 8px 25px ${colors.border}40`,
        }}
      >
        <div className="text-center leading-tight">
          {data.label}
        </div>
      </div>
    );
  };

  const nodeTypes: NodeTypes = {
    default: CustomNode,
  };

  return (
    <>
      <div
        ref={reactFlowWrapper}
        className={`relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-50 m-0 rounded-none' : 'h-[600px]'
          }`}
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
          nodeTypes={nodeTypes}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          minZoom={0.3}
          maxZoom={2}
        >
          <Background
            variant="dots"
            gap={20}
            size={1}
            color="#94a3b8"
          />
          <Controls
            showZoom={true}
            showFitView={true}
            showInteractive={false}
            position="bottom-left"
          />
          <MiniMap
            zoomable
            pannable
            nodeColor={(node) => {
              const level = node.data?.level || 0;
              return level === 0 ? '#667eea' :
                level === 1 ? '#f093fb' : '#4facfe';
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
            position="bottom-right"
          />
          <Panel position="top-right" className="flex gap-2">
            <Button
              onClick={() => setShowExportDialog(true)}
              variant="outline"
              size="sm"
              className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700 shadow-lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={toggleFullscreen}
              variant="outline"
              size="sm"
              className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700 shadow-lg"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 mr-2" />
              ) : (
                <Maximize2 className="w-4 h-4 mr-2" />
              )}
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </Button>
          </Panel>
        </ReactFlow>
      </div>

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Export Mind Map
              </h3>
              <Button
                onClick={() => setShowExportDialog(false)}
                variant="ghost"
                size="sm"
                className="p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <Button
                onClick={exportAsImage}
                variant="outline"
                className="w-full justify-start"
              >
                <FileImage className="w-4 h-4 mr-3" />
                Export as PNG Image
              </Button>
              <Button
                onClick={exportAsPDF}
                variant="outline"
                className="w-full justify-start"
              >
                <FileText className="w-4 h-4 mr-3" />
                Export as PDF
              </Button>
              <Button
                onClick={exportAsJSON}
                variant="outline"
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-3" />
                Export as JSON (Data)
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Wrapper component to provide ReactFlow context
const MindMapWrapper: React.FC<MindMapProps> = (props) => (
  <ReactFlowProviderComponent>
    <MindMap {...props} />
  </ReactFlowProviderComponent>
);

export default MindMapWrapper;
