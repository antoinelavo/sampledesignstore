import React, { useState } from 'react';
import { HexColorPicker } from "react-colorful";
import SpinnablePreview from '@/components/SpinnablePreview';
import SpinningCard3D from '@/components/SpinningCard3D';


// Placeholder Background SVG - Replace with your actual import
const BackgroundSVG = ({ fill }) => (
  <g>
    <svg width="159" height="198" viewBox="0 0 159 198" fill={fill} xmlns="http://www.w3.org/2000/svg">
    <path d="M141.804 94.4293C155.304 87.9293 160.163 59.7757 139.804 41.9293L134.804 49.4293C136.983 38.0021 138.688 31.4669 124.304 24.4293C118.684 13.832 117.39 6.23507 96.3041 9.42928C92.2339 8.89008 89.3796 8.33896 83.3041 6.92928C76.6989 3.31287 70.0674 4.76288 54.8041 11.4293C50.7024 8.244 44.0004 17.5361 34.3041 28.4293C3.36343 52.5819 -8.05313 76.3018 24.8041 100.429V192.929H59.3041C56.0687 162.178 60.9548 151.94 83.3041 147.929C102.015 152.717 106.683 160.862 96.3041 192.929H134.804L132.804 122.929C135.404 116.848 134.771 113.697 130.804 108.429L110.304 113.929C122.692 110.771 129.626 108.399 141.804 94.4293ZM141.804 94.4293L130.804 74.9293" stroke="none" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>

  </g>
);

// Placeholder Foreground SVG - Replace with your actual import  
const ForegroundSVG = () => (
  <g>
        <svg width="163" height="201" viewBox="0 0 163 201" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M27.2271 160.401V195.401H62.2271C58.9068 164.435 62.938 153.02 85.7271 148.401C106.212 153.345 109.364 163.655 100.227 195.401H136.727V135.401" stroke="black" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M27.2271 148.401V100.901C9.39339 91.1234 4.15284 82.6297 10.7271 57.401C17.427 38.0523 35.9793 27.748 37.7271 29.901" stroke="black" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M40.2271 100.901C52.5981 96.6011 56.952 90.7284 60.7271 74.901" stroke="black" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M47.2271 20.901C49.8498 14.84 52.1668 12.3228 59.7271 11.401C75.3852 4.9479 79.6353 5.48826 86.7271 6.90103" stroke="black" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M100.727 10.4011C115.467 7.22822 121.036 11.5334 128.227 25.4011C141.456 32.0626 140.335 39.0636 138.727 51.4011L141.227 43.9011C147.916 44.3629 149.281 47.5725 151.227 53.9011" stroke="black" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M154.727 63.901C159.138 82.8494 155.872 89.3492 143.727 96.401" stroke="black" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M134.227 76.401C151.31 98.9088 141.073 105.672 113.227 114.901" stroke="black" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M132.227 108.401C137.091 112.73 138.547 115.783 136.727 123.401" stroke="black" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
        <ellipse cx="89.2271" cy="67.901" rx="6" ry="7.5" fill="black"/>
        <ellipse cx="124.227" cy="64.401" rx="6" ry="7" fill="black"/>
        <ellipse cx="117.727" cy="87.901" rx="10.5" ry="7.5" fill="black"/>
        </svg>
  </g>
);

function ColorPicker({ label, color, onChange, presets }) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3 mb-3">
        <CustomColorPicker color={color} onChange={onChange} />
        <span className="text-sm text-gray-600">클릭하시면 원하는 삭생을 고르실 수 있습니다.</span>
      </div>
      <div className="flex gap-2">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onChange(preset.value)}
            className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-colors"
            style={{ backgroundColor: preset.value }}
            title={preset.name}
          />
        ))}
      </div>
    </div>
  );
}

// Simple color picker using react-colorful
const CustomColorPicker = ({ color, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="w-12 h-8 rounded border-2 border-gray-300 cursor-pointer shadow-sm"
        style={{ backgroundColor: color }}
      />
      
      {showPicker && (
        <div 
          className="absolute top-10 left-0 z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-4"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* React Colorful Color Picker */}
          <div className="mb-4">
            <HexColorPicker color={color} onChange={onChange} />
          </div>

          {/* Color Preview */}
          <div 
            className="w-full h-12 rounded mb-4 border border-gray-300"
            style={{ backgroundColor: color }}
          />
          
          {/* Manual hex input */}
          <input
            type="text"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono mb-3"
            placeholder="#ffffff"
          />
          
          {/* Close button */}
          <button
            onClick={() => setShowPicker(false)}
            className="w-full bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default function SvgColorTest() {
  // State for the two customizable quadrants
  const [topRightColor, setTopRightColor] = useState('#ff6b6b');
  const [bottomLeftColor, setBottomLeftColor] = useState('#4ecdc4');
  const [backgroundColor, setBackgroundColor] = useState('#fbe5bf')

  // Preset colors
  const presetColors = [
    { name: 'Beige', value: '#fbe5bf' },
    { name: 'Brown', value: '#c18520' },
    { name: 'Gray', value: '#aaaaaa' },
    { name: 'Black', value: '#000000' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">제품 색상 고르기</h1>
      
    {/* First Section: Background/Foreground SVG */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-[3em]">
        
        {/* SVG Preview with Background/Foreground */}
        <div className="bg-gray-50 p-8 rounded-lg" style={{ perspective: 400 }}>
          
            <div className="relative">
              <svg 
                width="250" 
                height="250" 
                viewBox="0 0 159 198"
              >
                {/* Background SVG - This will change color */}
                <BackgroundSVG fill={backgroundColor} />
                
                {/* Foreground SVG - This stays static */}
                <ForegroundSVG />
              </svg>
            </div>
        
          {/* Color Summary */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              배경 색상: <span className="font-mono">{backgroundColor}</span>
            </p>
          </div>
        </div>

        {/* Color Picker for Background */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-6">배경 색상 고르기</h2>
          
          <ColorPicker
            label="배경 색상"
            color={backgroundColor}
            onChange={setBackgroundColor}
            presets={presetColors}
          />

          {/* Reset Button */}
          <button
            onClick={() => {
              setBackgroundColor('#ff6b6b');
            }}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
          >
            기본 색상으로 바꾸기
          </button>

          {/* JSON Output for Testing */}
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="text-sm font-medium text-gray-700 mb-2">현재 선택된 배경 색상</h3>
            <pre className="text-xs text-gray-600 font-mono">
              {JSON.stringify({
                backgroundColor: backgroundColor
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Second Section: Quadrant Test */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SVG Preview */}
        <div className="bg-gray-50 p-8 rounded-lg" style={{ perspective: 400 }}>
          <svg 
            width="250" 
            height="250" 
            viewBox="0 0 200 200"
            className="border border-gray-300 rounded-lg shadow-lg"
          >
            {/* Top-left quadrant (static gray) */}
            <rect
              x="0"
              y="0" 
              width="100"
              height="100"
              fill="#e5e7eb"
              stroke="#374151"
              strokeWidth="1"
            />
            
            {/* Top-right quadrant (customizable) */}
            <rect
              x="100"
              y="0"
              width="100" 
              height="100"
              fill={topRightColor}
              stroke="#374151"
              strokeWidth="1"
            />
            
            {/* Bottom-left quadrant (customizable) */}
            <rect
              x="0"
              y="100"
              width="100"
              height="100" 
              fill={bottomLeftColor}
              stroke="#374151"
              strokeWidth="1"
            />
            
            {/* Bottom-right quadrant (static gray) */}
            <rect
              x="100"
              y="100"
              width="100"
              height="100"
              fill="#e5e7eb"
              stroke="#374151"
              strokeWidth="1"
            />

            {/* Center lines for clarity */}
            <line x1="100" y1="0" x2="100" y2="200" stroke="#374151" strokeWidth="2" />
            <line x1="0" y1="100" x2="200" y2="100" stroke="#374151" strokeWidth="2" />
          </svg>
          
          {/* Color Summary */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
                오른쪽 위 색상: <span className="font-mono">{topRightColor}</span>
            </p>
            <p className="text-sm text-gray-600">
                왼쪽 아래 색상: <span className="font-mono">{bottomLeftColor}</span>
            </p>
          </div>
        </div>

        {/* Color Pickers */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-6">색상 고르기</h2>
          
          <ColorPicker
            label="오른쪽 위"
            color={topRightColor}
            onChange={setTopRightColor}
            presets={presetColors}
          />
          
          <ColorPicker
            label="왼쪽 아래" 
            color={bottomLeftColor}
            onChange={setBottomLeftColor}
            presets={presetColors}
          />

          {/* Reset Button */}
          <button
            onClick={() => {
              setTopRightColor('#ff6b6b');
              setBottomLeftColor('#4ecdc4');
            }}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
          >
            기본 색상으로 바꾸기
          </button>

          {/* JSON Output for Testing */}
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="text-sm font-medium text-gray-700 mb-2">현재 선택된 색상</h3>
            <pre className="text-xs text-gray-600 font-mono">
                {JSON.stringify({
                topRightColor,
                bottomLeftColor
                }, null, 2)}
            </pre>
          </div>
        </div>
      </div>


      {/* Third Section: React Three Fiber */}
      {/* <SpinningCard3D/> */}



    </div>
  );
}