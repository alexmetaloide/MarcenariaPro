
import React, { useState, useMemo, useEffect } from 'react';
import { Trash2, Plus, Minus, LayoutTemplate, Box, ChevronLeft, ChevronRight, Maximize, Type, AlignVerticalJustifyCenter, AlignHorizontalJustifyCenter, Square, Settings2, Printer, Sparkles, ZoomIn, ZoomOut, Eye, EyeOff, Lightbulb, Save } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CutPiece } from '../../types';

// --- Interfaces para o Algoritmo de Corte ---
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PlacedPiece extends Rect {
  id: number;
  originalId: number;
  rotated: boolean;
  label: string;
  name?: string;
}

interface Bin {
  id: number;
  width: number;
  height: number;
  freeRects: Rect[];
  placedPieces: PlacedPiece[];
  efficiency: number;
}

type GrainDirection = 'none' | 'vertical' | 'horizontal';

interface CutPlanEstimatorProps {}

// --- Componente de Visualização da Chapa (Tela Interativa) ---
interface BoardVisualizerProps {
  bin: Bin;
  width: number;
  height: number;
  grainDirection: GrainDirection;
  showNames: boolean;
  fontSize: number;
  idPrefix?: string;
}

const BoardVisualizer: React.FC<BoardVisualizerProps> = ({ 
  bin, 
  width, 
  height, 
  grainDirection, 
  showNames, 
  fontSize,
  idPrefix = ''
}) => {
  
  // Componente interno para Rótulos
  const DimensionLabel = ({ x, y, w, h, rotated, isWaste, baseFontSize, name }: { x: number, y: number, w: number, h: number, rotated?: boolean, isWaste?: boolean, baseFontSize: number, name?: string }) => {
    const showWidth = w >= 1; 
    const showHeight = h >= 1;
    
    // Cores de alto contraste
    const textColor = isWaste ? '#64748b' : '#3f2c22'; 
    const padding = Math.max(0.5, baseFontSize * 0.6); 
    
    const textStyle: React.CSSProperties = { 
      textShadow: isWaste ? 'none' : '0px 0px 3px rgba(255,255,255,0.8), 0px 0px 1px rgba(255,255,255,1)',
      pointerEvents: 'none',
      userSelect: 'none',
      fontFamily: 'sans-serif'
    };

    const renderGrainIcon = () => {
      if (grainDirection === 'none') return null;
      const isVert = grainDirection === 'vertical' ? !rotated : rotated;
      const iconSize = baseFontSize * 0.8; 
      const ix = x + padding + (baseFontSize * 0.1); 
      const iy = y + h - padding - (baseFontSize * 0.1);

      if (w < iconSize * 2 || h < iconSize * 2) return null;

      return (
        <g transform={`translate(${ix}, ${iy})`} opacity="0.6">
           {isVert ? (
             <path d={`M ${iconSize/2} 0 V -${iconSize} M 0 -${iconSize*0.3} L ${iconSize/2} 0 L ${iconSize} -${iconSize*0.3} M 0 -${iconSize*0.7} L ${iconSize/2} -${iconSize} L ${iconSize} -${iconSize*0.7}`} fill="none" stroke={textColor} strokeWidth="0.15" strokeLinecap="round" strokeLinejoin="round" />
           ) : (
             <path d={`M 0 -${iconSize/2} H ${iconSize} M ${iconSize*0.3} 0 L 0 -${iconSize/2} L ${iconSize*0.3} -${iconSize} M ${iconSize*0.7} 0 L ${iconSize} -${iconSize/2} L ${iconSize*0.7} -${iconSize}`} fill="none" stroke={textColor} strokeWidth="0.15" strokeLinecap="round" strokeLinejoin="round" />
           )}
        </g>
      );
    };

    return (
      <g>
        {!isWaste && name && showNames && (
           <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="middle" fontSize={baseFontSize * 1.2} fontWeight="800" fill="#3f2c22" style={textStyle}>{name}</text>
        )}
        {showWidth && (
          <text x={x + w / 2} y={y + padding + (baseFontSize/2)} textAnchor="middle" dominantBaseline="hanging" fontSize={baseFontSize} fill={textColor} fontWeight="700" style={textStyle}>{Math.round(w)}</text>
        )}
        {showHeight && (
          <text x={x + padding + (baseFontSize/2)} y={y + h / 2} textAnchor="middle" dominantBaseline="auto" transform={`rotate(-90, ${x + padding + (baseFontSize/2)}, ${y + h / 2})`} fontSize={baseFontSize} fill={textColor} fontWeight="700" style={textStyle}>{Math.round(h)}</text>
        )}
        {!isWaste && showWidth && showHeight && rotated && (
          <text x={x + w - padding} y={y + h - padding} textAnchor="end" dominantBaseline="auto" fontSize={baseFontSize * 1.2} fontWeight="bold" fill={textColor} className="opacity-60" style={textStyle}>&#8635;</text>
        )}
        {showWidth && showHeight && renderGrainIcon()}
      </g>
    );
  };

  const patternIdV = `${idPrefix}grain-v-${bin.id}`;
  const patternIdH = `${idPrefix}grain-h-${bin.id}`;

  const woodBaseColor = "#fffbeb"; 
  const woodGrainColor = "#d97706"; 
  const pieceColor = "#f59e0b"; 
  const pieceBorder = "#78350f"; 
  const wasteBorder = "#cbd5e1"; 

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full block bg-white" preserveAspectRatio="xMidYMid meet">
      <defs>
        <pattern id={patternIdV} width="100" height="300" patternUnits="userSpaceOnUse">
            <rect width="100" height="300" fill={woodBaseColor} />
            <path d="M0,0 Q30,75 10,150 T0,300" stroke={woodGrainColor} strokeWidth="1.5" fill="none" opacity="0.1" />
            <path d="M40,0 Q70,75 50,150 T40,300" stroke={woodGrainColor} strokeWidth="2" fill="none" opacity="0.08" />
            <path d="M80,0 Q50,75 90,150 T80,300" stroke={woodGrainColor} strokeWidth="1.5" fill="none" opacity="0.1" />
            <path d="M15,0 Q25,75 15,150 T15,300" stroke={woodGrainColor} strokeWidth="0.5" fill="none" opacity="0.3" />
            <path d="M35,0 Q45,75 35,150 T35,300" stroke={woodGrainColor} strokeWidth="0.4" fill="none" opacity="0.25" />
            <line x1="10" y1="0" x2="10" y2="300" stroke={woodGrainColor} strokeWidth="0.1" opacity="0.1" />
        </pattern>

        <pattern id={patternIdH} width="300" height="100" patternUnits="userSpaceOnUse">
            <rect width="300" height="100" fill={woodBaseColor} />
            <path d="M0,10 Q75,30 150,10 T300,10" stroke={woodGrainColor} strokeWidth="1.5" fill="none" opacity="0.1" />
            <path d="M0,50 Q75,70 150,50 T300,50" stroke={woodGrainColor} strokeWidth="2" fill="none" opacity="0.08" />
            <path d="M0,80 Q75,60 150,90 T300,80" stroke={woodGrainColor} strokeWidth="1.5" fill="none" opacity="0.1" />
            <path d="M0,20 Q75,35 150,20 T300,20" stroke={woodGrainColor} strokeWidth="0.5" fill="none" opacity="0.3" />
            <path d="M0,40 Q75,55 150,40 T300,40" stroke={woodGrainColor} strokeWidth="0.4" fill="none" opacity="0.25" />
            <line x1="0" y1="15" x2="300" y2="15" stroke={woodGrainColor} strokeWidth="0.1" opacity="0.1" />
        </pattern>
      </defs>

      <rect x="0" y="0" width={width} height={height} fill={woodBaseColor} stroke="#94a3b8" strokeWidth="0.1" />

      {grainDirection !== 'none' && (
          <rect x="0" y="0" width={width} height={height} fill={grainDirection === 'vertical' ? `url(#${patternIdV})` : `url(#${patternIdH})`} className="pointer-events-none" />
      )}
      
      {bin.freeRects.map((rect, idx) => (
        <g key={`free-${idx}`}>
            <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} fill="rgba(255, 255, 255, 0.4)" stroke={wasteBorder} strokeWidth="0.2" strokeDasharray="4 2" />
            <DimensionLabel x={rect.x} y={rect.y} w={rect.w} h={rect.h} isWaste baseFontSize={fontSize} />
        </g>
      ))}

      {bin.placedPieces.map((piece, idx) => (
        <g key={`piece-${idx}`}>
          <rect x={piece.x} y={piece.y} width={piece.w} height={piece.h} fill={pieceColor} fillOpacity="0.4" stroke={pieceBorder} strokeWidth="0.3" />
          <line x1={piece.x + 0.3} y1={piece.y + 0.3} x2={piece.x + piece.w - 0.3} y2={piece.y + 0.3} stroke="rgba(255,255,255,0.6)" strokeWidth="0.2" />
          <line x1={piece.x + 0.3} y1={piece.y + 0.3} x2={piece.x + 0.3} y2={piece.y + piece.h - 0.3} stroke="rgba(255,255,255,0.6)" strokeWidth="0.2" />
          <DimensionLabel x={piece.x} y={piece.y} w={piece.w} h={piece.h} rotated={piece.rotated} baseFontSize={fontSize} name={piece.name} />
        </g>
      ))}
    </svg>
  );
};

// --- Componente Principal ---
export const CutPlanEstimator: React.FC<CutPlanEstimatorProps> = () => {
  // Carregar dados salvos do localStorage
  const getSavedData = () => {
    try {
      const saved = localStorage.getItem('marcenariapro_cutplan_data');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Erro ao carregar plano de corte", e);
      return null;
    }
  };

  const savedData = getSavedData();

  const [pieces, setPieces] = useState<CutPiece[]>(savedData?.pieces || []);
  const [newPiece, setNewPiece] = useState({ 
    height: '', 
    width: '', 
    qty: 1, 
    name: '',
    thickness: '15mm 2F' // Default
  });
  const [boardSize, setBoardSize] = useState(savedData?.boardSize || { height: 275, width: 185 }); 
  const [grainDirection, setGrainDirection] = useState<GrainDirection>(savedData?.grainDirection || 'none');
  const [selectedBinIndex, setSelectedBinIndex] = useState(0);
  const [fontSize, setFontSize] = useState(savedData?.fontSize || 4);
  const [bladeThickness, setBladeThickness] = useState(savedData?.bladeThickness || 0.4);
  const [showNames, setShowNames] = useState(savedData?.showNames ?? false);
  const [zoom, setZoom] = useState(savedData?.zoom || 1);
  const [saveStatus, setSaveStatus] = useState<string>('');

  const THICKNESS_OPTIONS = [
    "6mm 2F", "6mm Crú",
    "9mm 2F", "9mm Crú",
    "15mm 2F", "15mm Crú",
    "18mm 2F", "18mm Crú",
    "25mm 2F", "25mm Crú"
  ];

  const handleSavePlan = () => {
    const dataToSave = {
      pieces,
      boardSize,
      grainDirection,
      bladeThickness,
      zoom,
      fontSize,
      showNames
    };
    localStorage.setItem('marcenariapro_cutplan_data', JSON.stringify(dataToSave));
    setSaveStatus('Salvo!');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const addPiece = () => {
    if(!newPiece.height || !newPiece.width) return;
    setPieces(prev => [...prev, { 
      id: Date.now(), 
      height: Number(newPiece.height), 
      width: Number(newPiece.width), 
      qty: Number(newPiece.qty),
      name: newPiece.name,
      thickness: newPiece.thickness
    }]);
    setNewPiece({ height: '', width: '', qty: 1, name: '', thickness: newPiece.thickness });
  };

  const removePiece = (id: number) => {
    setPieces(prev => prev.filter(p => String(p.id) !== String(id)));
  };

  const loadExamplePieces = () => {
    const examples: CutPiece[] = [
      { id: Date.now() + 1, name: 'Lateral Esq', height: 160, width: 50, qty: 1, thickness: '15mm 2F' },
      { id: Date.now() + 2, name: 'Lateral Dir', height: 160, width: 50, qty: 1, thickness: '15mm 2F' },
      { id: Date.now() + 3, name: 'Base', height: 80, width: 50, qty: 1, thickness: '15mm 2F' },
      { id: Date.now() + 4, name: 'Topo', height: 80, width: 50, qty: 1, thickness: '15mm 2F' },
      { id: Date.now() + 5, name: 'Prateleira', height: 76.4, width: 45, qty: 3, thickness: '15mm 2F' },
      { id: Date.now() + 6, name: 'Porta', height: 155, width: 39.5, qty: 2, thickness: '18mm 2F' },
      { id: Date.now() + 7, name: 'Fundo', height: 155, width: 79, qty: 1, thickness: '6mm Crú' },
    ];
    if (pieces.length === 0) {
      setPieces(examples);
    } else {
      if(window.confirm("Deseja substituir sua lista atual pelos exemplos? Cancelar irá adicionar ao final.")) {
         setPieces(examples);
      } else {
         setPieces(prev => [...prev, ...examples]);
      }
    }
  };

  // --- Algoritmo de Corte ---
  const resultBins = useMemo(() => {
    if (pieces.length === 0) return [];
    
    let allPiecesToCut: { id: number, w: number, h: number, label: string, area: number, name?: string, thickness?: string }[] = [];
    pieces.forEach(p => {
      for (let i = 0; i < p.qty; i++) {
        allPiecesToCut.push({ 
          id: p.id, 
          w: p.width, 
          h: p.height, 
          label: `${p.height}x${p.width}`,
          area: p.width * p.height,
          name: p.name,
          thickness: p.thickness
        });
      }
    });

    allPiecesToCut.sort((a, b) => b.area - a.area);

    const bins: Bin[] = [];
    const createBin = (id: number): Bin => ({
      id,
      width: boardSize.width,
      height: boardSize.height,
      freeRects: [{ x: 0, y: 0, w: boardSize.width, h: boardSize.height }],
      placedPieces: [],
      efficiency: 0
    });

    const findBestFit = (piece: typeof allPiecesToCut[0]) => {
      let bestFit = { binIndex: -1, rectIndex: -1, score: Number.MAX_VALUE, rotated: false };

      bins.forEach((bin, binIndex) => {
        bin.freeRects.forEach((rect, rectIndex) => {
          const canTryNormal = grainDirection === 'none' || grainDirection === 'vertical';
          const canTryRotated = grainDirection === 'none' || grainDirection === 'horizontal';

          if (canTryNormal && piece.w <= rect.w && piece.h <= rect.h) {
              const score = Math.min(rect.w - piece.w, rect.h - piece.h);
              if (score < bestFit.score) bestFit = { binIndex, rectIndex, score, rotated: false };
          }

          if (canTryRotated && piece.h <= rect.w && piece.w <= rect.h) {
              const score = Math.min(rect.w - piece.h, rect.h - piece.w);
              if (score < bestFit.score) bestFit = { binIndex, rectIndex, score, rotated: true };
          }
        });
      });
      return bestFit;
    };

    for (const piece of allPiecesToCut) {
      let fit = findBestFit(piece);
      if (fit.binIndex === -1) {
        bins.push(createBin(bins.length + 1));
        fit = findBestFit(piece);
      }

      if (fit.binIndex !== -1) {
        const bin = bins[fit.binIndex];
        const freeRect = bin.freeRects[fit.rectIndex];
        const w = fit.rotated ? piece.h : piece.w;
        const h = fit.rotated ? piece.w : piece.h;

        bin.placedPieces.push({
          x: freeRect.x, y: freeRect.y, w, h,
          id: Date.now() + Math.random(), originalId: piece.id, rotated: fit.rotated, label: piece.label, name: piece.name
        });

        const k = bladeThickness;
        const rightW = freeRect.w - w - k;
        const bottomH = freeRect.h - h - k;
        let newRects: Rect[] = [];

        if (rightW * freeRect.h > bottomH * freeRect.w) {
             if (rightW > 0) newRects.push({ x: freeRect.x + w + k, y: freeRect.y, w: rightW, h: freeRect.h });
             if (bottomH > 0) newRects.push({ x: freeRect.x, y: freeRect.y + h + k, w: w, h: bottomH });
        } else {
             if (bottomH > 0) newRects.push({ x: freeRect.x, y: freeRect.y + h + k, w: freeRect.w, h: bottomH });
             if (rightW > 0) newRects.push({ x: freeRect.x + w + k, y: freeRect.y, w: rightW, h: h });
        }
        bin.freeRects.splice(fit.rectIndex, 1);
        bin.freeRects.push(...newRects);
      }
    }

    bins.forEach(bin => {
      const usedArea = bin.placedPieces.reduce((acc, p) => acc + (p.w * p.h), 0);
      const totalArea = bin.width * bin.height;
      bin.efficiency = (usedArea / totalArea) * 100;
    });

    return bins;
  }, [pieces, boardSize, grainDirection, bladeThickness]);

  if (selectedBinIndex >= resultBins.length && resultBins.length > 0) setSelectedBinIndex(0);
  const currentBin = resultBins[selectedBinIndex];

  // Cálculos para o relatório
  const totalUsedArea = resultBins.reduce((acc, bin) => acc + (bin.efficiency / 100 * (bin.width * bin.height)), 0);
  const totalBoardArea = resultBins.length * (boardSize.width * boardSize.height);
  const globalEfficiency = totalBoardArea > 0 ? (totalUsedArea / totalBoardArea) * 100 : 0;

  const generateBoardSVGString = (bin: Bin, width: number, height: number, idPrefix: string) => {
    const patternIdV = `${idPrefix}gv-${bin.id}`;
    const patternIdH = `${idPrefix}gh-${bin.id}`;
    
    // Configurações visuais (idênticas ao BoardVisualizer)
    const woodBaseColor = "#fffbeb"; 
    const woodGrainColor = "#d97706"; 
    const pieceColor = "#f59e0b"; 
    const pieceBorder = "#78350f"; 
    const wasteBorder = "#cbd5e1"; 
    
    // Helpers para gerar texto
    const createText = (x: number, y: number, text: string | number, rot: number = 0, anchor: string = "middle", weight: string = "bold", size: number = fontSize) => {
        let transform = '';
        if (rot !== 0) transform = `transform="rotate(${rot}, ${x}, ${y})"`;
        return `<text x="${x}" y="${y}" text-anchor="${anchor}" ${transform} font-size="${size}" font-family="sans-serif" font-weight="${weight}" fill="#3f2c22">${text}</text>`;
    };

    let svgContent = '';

    // Defs
    svgContent += `<defs>
        <pattern id="${patternIdV}" width="100" height="300" patternUnits="userSpaceOnUse">
            <rect width="100" height="300" fill="${woodBaseColor}" />
            <path d="M0,0 Q30,75 10,150 T0,300" stroke="${woodGrainColor}" stroke-width="1.5" fill="none" opacity="0.1" />
            <path d="M40,0 Q70,75 50,150 T40,300" stroke="${woodGrainColor}" stroke-width="2" fill="none" opacity="0.08" />
            <path d="M80,0 Q50,75 90,150 T80,300" stroke="${woodGrainColor}" stroke-width="1.5" fill="none" opacity="0.1" />
        </pattern>
        <pattern id="${patternIdH}" width="300" height="100" patternUnits="userSpaceOnUse">
            <rect width="300" height="100" fill="${woodBaseColor}" />
            <path d="M0,10 Q75,30 150,10 T300,10" stroke="${woodGrainColor}" stroke-width="1.5" fill="none" opacity="0.1" />
            <path d="M0,50 Q75,70 150,50 T300,50" stroke="${woodGrainColor}" stroke-width="2" fill="none" opacity="0.08" />
        </pattern>
    </defs>`;

    // Background
    svgContent += `<rect x="0" y="0" width="${width}" height="${height}" fill="${woodBaseColor}" stroke="#94a3b8" stroke-width="0.1" />`;
    if (grainDirection !== 'none') {
        const fill = grainDirection === 'vertical' ? `url(#${patternIdV})` : `url(#${patternIdH})`;
        svgContent += `<rect x="0" y="0" width="${width}" height="${height}" fill="${fill}" />`;
    }

    // Waste
    bin.freeRects.forEach(r => {
        svgContent += `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="rgba(255,255,255,0.4)" stroke="${wasteBorder}" stroke-width="0.2" stroke-dasharray="4 2" />`;
        if(r.w >= 1) svgContent += createText(r.x + r.w/2, r.y + fontSize, Math.round(r.w), 0, "middle", "normal", fontSize);
        if(r.h >= 1) svgContent += createText(r.x + fontSize, r.y + r.h/2, Math.round(r.h), -90, "middle", "normal", fontSize);
    });

    // Pieces
    bin.placedPieces.forEach(p => {
        svgContent += `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="${pieceColor}" fill-opacity="0.4" stroke="${pieceBorder}" stroke-width="0.3" />`;
        if (p.name && showNames) svgContent += createText(p.x + p.w/2, p.y + p.h/2, p.name, 0, "middle", "800", fontSize * 1.2);
        if(p.w >= 1) svgContent += createText(p.x + p.w/2, p.y + fontSize, Math.round(p.w), 0, "middle", "bold", fontSize);
        if(p.h >= 1) svgContent += createText(p.x + fontSize, p.y + p.h/2, Math.round(p.h), -90, "middle", "bold", fontSize);
        if(p.rotated) svgContent += `<text x="${p.x + p.w - fontSize}" y="${p.y + p.h - fontSize}" font-size="${fontSize}" fill="#3f2c22" opacity="0.6">&#8635;</text>`;
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="width:100%; height:auto; max-height:260mm; display:block; border:1px solid #ccc; margin: 0 auto;">${svgContent}</svg>`;
  };

  const handlePrintReport = () => {
    let companyName = "MarcenariaPro";
    try {
        const keys = Object.keys(localStorage);
        const compKey = keys.find(k => k.startsWith('marcenariapro_company_'));
        if (compKey) {
            const saved = JSON.parse(localStorage.getItem(compKey) || '{}');
            if (saved.name) companyName = saved.name;
        }
    } catch (e) {}

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Relatório de Corte - ${companyName}</title>
            <style>
                @page { size: A4 portrait; margin: 10mm; }
                * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                html, body { width: 100%; margin: 0; padding: 0; color: #000; background: #fff; font-family: 'Segoe UI', sans-serif; }
                .container { width: 99%; margin: 0 auto; display: block; }
                .header { display: flex; justify-content: space-between; border-bottom: 2px solid #d97706; padding-bottom: 10px; margin-bottom: 15px; }
                .title { font-size: 24px; font-weight: bold; color: #d97706; text-transform: uppercase; }
                .meta { text-align: right; font-size: 12px; color: #555; }
                .section { margin-bottom: 25px; break-inside: avoid; }
                .section-title { font-size: 16px; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px; color: #333; }
                .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; text-align: center; }
                .stat-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 4px; }
                .stat-val { font-size: 20px; font-weight: bold; color: #0f172a; }
                .stat-label { font-size: 11px; text-transform: uppercase; color: #64748b; margin-top: 4px; }
                table { width: 100%; border-collapse: collapse; font-size: 13px; }
                th { text-align: left; background: #f1f5f9; padding: 8px; border-bottom: 2px solid #e2e8f0; font-weight: bold; }
                td { padding: 8px; border-bottom: 1px solid #f1f5f9; }
                tr:nth-child(even) { background: #f8fafc; }
                .board-container { margin-bottom: 30px; break-inside: avoid; page-break-inside: avoid; }
                .board-header { background: #1e293b; color: white; padding: 8px 12px; font-weight: bold; font-size: 14px; display: flex; justify-content: space-between; border-radius: 4px 4px 0 0; }
                .board-wrapper { border: 1px solid #cbd5e1; padding: 10px; background: white; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div>
                        <div class="title">Relatório de Corte</div>
                        <div style="font-size: 14px; font-weight: 500;">${companyName}</div>
                    </div>
                    <div class="meta">
                        <div>Data: ${new Date().toLocaleDateString('pt-BR')}</div>
                        <div>Chapa Base: ${boardSize.height} x ${boardSize.width} cm</div>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">RESUMO DO PROJETO</div>
                    <div class="stats-grid">
                        <div class="stat-box">
                            <div class="stat-val" style="color: #d97706">${resultBins.length}</div>
                            <div class="stat-label">Total de Chapas</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-val" style="color: #16a34a">${globalEfficiency.toFixed(1)}%</div>
                            <div class="stat-label">Aproveitamento Global</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-val" style="color: #2563eb">${pieces.reduce((acc, p) => acc + p.qty, 0)}</div>
                            <div class="stat-label">Total de Peças</div>
                        </div>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">LISTA DE PEÇAS</div>
                    <table>
                        <thead>
                            <tr>
                                <th width="10%">Qtd</th>
                                <th>Espessura</th>
                                <th>Nome / Descrição</th>
                                <th>Dimensões (cm)</th>
                                <th style="text-align: right">Área Total (m²)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pieces.map(p => `
                                <tr>
                                    <td style="font-weight: bold; text-align: center">${p.qty}</td>
                                    <td>${p.thickness || '-'}</td>
                                    <td>${p.name || 'Sem nome'}</td>
                                    <td style="font-family: monospace">${p.height} x ${p.width}</td>
                                    <td style="text-align: right">${((p.height * p.width * p.qty) / 10000).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
        `;
        resultBins.forEach((bin, idx) => {
            html += `
                <div class="board-container">
                    <div class="board-header">
                        <span>Chapa ${idx + 1}</span>
                        <span style="opacity: 0.9; font-weight: normal;">Eficiência: ${bin.efficiency.toFixed(1)}%</span>
                    </div>
                    <div class="board-wrapper">
                        ${generateBoardSVGString(bin, boardSize.width, boardSize.height, `print-b${idx}-`)}
                    </div>
                </div>
            `;
        });
        html += `</div><script>window.onload = function() { window.print(); }</script></body></html>`;
        printWindow.document.write(html);
        printWindow.document.close();
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in gap-4 relative">
      
      {/* Header UI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <LayoutTemplate className="text-amber-600" /> Otimizador de Corte
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Planeje seus cortes para maximizar o uso de material.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0">
          <Button variant="secondary" icon={Save} onClick={handleSavePlan} className="text-xs h-9 min-w-[100px]">
            {saveStatus || 'Salvar Plano'}
          </Button>
          <Button variant="primary" icon={Printer} onClick={handlePrintReport} className="text-xs h-9">
            Imprimir Relatório
          </Button>
          
          <div className="text-right border-l border-slate-200 dark:border-slate-700 pl-4 ml-2">
             <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Total Chapas</p>
             <p className="text-2xl font-bold text-amber-600">{resultBins.length}</p>
          </div>
        </div>
      </div>
      
      {/* Tutorial Banner when empty */}
      {pieces.length === 0 && (
         <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 p-3 rounded-lg flex items-start gap-3">
            <Lightbulb className="text-amber-600 shrink-0 mt-1" size={18} />
            <div className="text-sm text-slate-700 dark:text-slate-300">
               <strong>Como usar:</strong>
               <ol className="list-decimal ml-4 mt-1 space-y-1">
                  <li>Configure o tamanho da chapa manualmente no painel esquerdo.</li>
                  <li>Adicione as peças que deseja cortar na "Lista de Peças".</li>
                  <li>O sistema calculará automaticamente o melhor aproveitamento no painel direito.</li>
               </ol>
            </div>
         </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[600px]">
        {/* Painel Esquerdo */}
        <div className="lg:w-1/3 flex flex-col gap-4 tools-pane">
          <Card className="flex flex-col gap-3">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2">
              <Box size={16} /> Configuração da Chapa (cm)
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Comprimento</label>
                <input 
                  type="number" 
                  value={boardSize.height || ''}
                  onChange={e => setBoardSize({...boardSize, height: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-black focus:ring-2 focus:ring-amber-200 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Largura</label>
                <input 
                  type="number" 
                  value={boardSize.width || ''}
                  onChange={e => setBoardSize({...boardSize, width: Number(e.target.value)})}
                  className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-black focus:ring-2 focus:ring-amber-200 outline-none transition-colors"
                />
              </div>
            </div>
            
            <div className="mt-2 border-t border-slate-100 dark:border-slate-700 pt-3">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">Sentido do Veio (Grão)</label>
              <div className="flex gap-2">
                <button onClick={() => setGrainDirection('none')} className={`flex-1 p-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 ${grainDirection === 'none' ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400' : 'bg-white dark:bg-slate-950 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}><Square size={16} /> Sem Veio</button>
                <button onClick={() => setGrainDirection('vertical')} className={`flex-1 p-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 ${grainDirection === 'vertical' ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400' : 'bg-white dark:bg-slate-950 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}><AlignVerticalJustifyCenter size={16} /> Comprimento</button>
                <button onClick={() => setGrainDirection('horizontal')} className={`flex-1 p-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 ${grainDirection === 'horizontal' ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400' : 'bg-white dark:bg-slate-950 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}><AlignHorizontalJustifyCenter size={16} /> Largura</button>
              </div>
            </div>

            <div className="mt-2 border-t border-slate-100 dark:border-slate-700 pt-3">
               <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2 mb-2"><Settings2 size={14} /> Configuração de Corte</h3>
               <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Espessura da Serra (cm)</label>
                  <input type="number" step="0.1" value={bladeThickness || ''} onChange={e => setBladeThickness(Number(e.target.value))} className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-black focus:ring-2 focus:ring-amber-200 outline-none"/>
               </div>
            </div>
          </Card>

          <Card className="flex flex-col gap-3 flex-1">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2"><Plus size={16} /> Lista de Peças</h3>
              <button onClick={loadExamplePieces} className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 underline flex items-center gap-1">
                <Sparkles size={12} /> Carregar Exemplo
              </button>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                 <Input className="bg-white" placeholder="Comp." type="number" value={newPiece.height} onChange={e => setNewPiece({...newPiece, height: e.target.value})} />
                 <Input className="bg-white" placeholder="Larg." type="number" value={newPiece.width} onChange={e => setNewPiece({...newPiece, width: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <select 
                    className="px-3 py-2.5 rounded-lg border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all bg-white text-slate-900 w-full text-sm"
                    value={newPiece.thickness}
                    onChange={e => setNewPiece({...newPiece, thickness: e.target.value})}
                 >
                    {THICKNESS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                 </select>
                 <Input className="bg-white" placeholder="Qtd." type="number" value={newPiece.qty} onChange={e => setNewPiece({...newPiece, qty: Number(e.target.value)})} />
              </div>
              <Input className="bg-white" placeholder="Nome (Opcional)" value={newPiece.name} onChange={e => setNewPiece({...newPiece, name: e.target.value})} />
              <Button onClick={addPiece} className="w-full text-sm" icon={Plus}>Adicionar</Button>
            </div>
            <div className="flex-1 overflow-auto min-h-[200px] border-t border-slate-100 dark:border-slate-700 mt-2 pt-2">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-900 dark:text-slate-400 uppercase">
                   <tr><th className="px-2 py-1">Qtd</th><th className="px-2 py-1">Dimensões/Nome</th><th className="px-2 py-1 text-right">Ação</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {pieces.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="px-2 py-2"><span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-2 py-1 rounded text-xs min-w-[30px] inline-block text-center">{p.qty}</span></td>
                      <td className="px-2 py-2 text-slate-600 dark:text-slate-300 font-medium">
                        <div>{p.height} <span className="text-slate-400 mx-1">x</span> {p.width} cm</div>
                        <div className="flex items-center gap-2">
                            {p.thickness && <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 px-1 rounded">{p.thickness}</span>}
                            {p.name && <span className="text-xs text-slate-400 italic truncate max-w-[80px]">{p.name}</span>}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-right">
                        <button 
                           onClick={(e) => { e.stopPropagation(); removePiece(p.id); }} 
                           className="text-slate-400 hover:text-red-500 p-1"
                        >
                           <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pieces.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-slate-400 text-xs">Nenhuma peça adicionada</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Painel Direito: Visualizador Interativo */}
        <div className="lg:w-2/3 flex flex-col h-full visualizer-pane">
           <Card className="flex-1 flex flex-col p-0 overflow-hidden bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 h-[600px] lg:h-auto">
             <div className="p-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-2 justify-between items-center">
                <div className="flex items-center gap-2">
                   <button disabled={selectedBinIndex === 0} onClick={() => setSelectedBinIndex(prev => Math.max(0, prev - 1))} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30"><ChevronLeft size={20} /></button>
                   <span className="text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">Chapa {resultBins.length > 0 ? selectedBinIndex + 1 : 0} de {resultBins.length}</span>
                   <button disabled={selectedBinIndex === resultBins.length - 1 || resultBins.length === 0} onClick={() => setSelectedBinIndex(prev => Math.min(resultBins.length - 1, prev + 1))} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30"><ChevronRight size={20} /></button>
                   
                   <div className="flex items-center gap-1 border-l border-r border-slate-200 dark:border-slate-700 px-2 mx-1">
                      <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"><ZoomOut size={16} /></button>
                      <span className="text-xs font-mono w-8 text-center text-slate-600 dark:text-slate-300">{Math.round(zoom * 100)}%</span>
                      <button onClick={() => setZoom(prev => Math.min(3, prev + 0.1))} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"><ZoomIn size={16} /></button>
                   </div>

                   <button onClick={() => setShowNames(!showNames)} className={`p-1 rounded border flex items-center gap-1 px-2 text-xs font-medium transition-colors ${showNames ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                      {showNames ? <Eye size={14}/> : <EyeOff size={14}/>} {showNames ? 'Nomes ON' : 'Nomes OFF'}
                   </button>

                   <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2 ml-1">
                      <Type size={14} className="text-slate-400 mr-1" />
                      <button onClick={() => setFontSize(prev => Math.max(1, prev - 0.5))} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"><Minus size={14} /></button>
                      <span className="text-xs font-mono w-8 text-center text-slate-600 dark:text-slate-300">{fontSize}</span>
                      <button onClick={() => setFontSize(prev => Math.min(20, prev + 0.5))} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"><Plus size={14} /></button>
                   </div>
                </div>
                {currentBin && (
                  <div className="flex gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                     <span className="flex items-center gap-1"><Maximize size={14}/> Aproveitamento: <span className="text-green-600 dark:text-green-400">{currentBin.efficiency.toFixed(1)}%</span></span>
                     <span className="flex items-center gap-1"><Box size={14}/> Peças: {currentBin.placedPieces.length}</span>
                  </div>
                )}
             </div>

             <div className="flex-1 flex items-center justify-center p-8 bg-slate-100 dark:bg-slate-950 overflow-auto">
                {currentBin ? (
                  <div 
                    className="relative shadow-2xl bg-white transition-transform duration-200 origin-center" 
                    style={{ aspectRatio: `${currentBin.width}/${currentBin.height}`, height: '100%', transform: `scale(${zoom})` }}
                  >
                    <BoardVisualizer 
                      bin={currentBin} 
                      width={currentBin.width} 
                      height={currentBin.height} 
                      grainDirection={grainDirection}
                      showNames={showNames}
                      fontSize={fontSize}
                      idPrefix="screen-"
                    />
                    <div className="absolute -bottom-6 left-0 w-full text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-300 dark:border-slate-700 pt-1">{currentBin.width} cm</div>
                    <div className="absolute top-0 -right-6 h-full flex items-center text-xs text-slate-500 dark:text-slate-400 border-l border-slate-300 dark:border-slate-700 pl-1 writing-vertical-lr" style={{writingMode: 'vertical-rl'}}>{currentBin.height} cm</div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400">
                    <LayoutTemplate size={48} className="mx-auto mb-2 opacity-50"/>
                    <p>Adicione peças para gerar o plano de corte.</p>
                  </div>
                )}
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
};
