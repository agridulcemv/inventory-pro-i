import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Mic, Send, X, Volume2 } from 'lucide-react';
import { useInventory } from '../../contexts/InventoryContext';

// Función para leer respuestas en voz alta
const speakResponse = (text) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    
    const cleanText = text
      .replace(/[📦📊💰🏆⚠️✅🔴🟡🟢💡🤔👥📋🛒🎯🔍🔊]/g, '')
      .replace(/\*\*/g, '')
      .replace(/###/g, '')
      .replace(/•/g, '')
      .trim();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = 1.1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(voice => voice.lang.startsWith('es'));
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }
};

export const AIAssistantPanel = ({ isOpen, onClose }) => {
  const { aiMessages, sendAIMessage } = useInventory();
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      sendAIMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceCommand = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('❌ Tu navegador no soporta reconocimiento de voz.\n\n✅ Usa Google Chrome o Microsoft Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      console.log('🎤 Escuchando...');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      
      console.log(`Escuchado: "${transcript}" (confianza: ${(confidence * 100).toFixed(0)}%)`);
      
      setInputMessage(transcript);
      sendAIMessage(transcript);
      setIsListening(false);
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Procesando tu solicitud');
        utterance.lang = 'es-ES';
        utterance.rate = 1.2;
        window.speechSynthesis.speak(utterance);
      }
    };

    recognition.onerror = (event) => {
      console.error('Error de reconocimiento:', event.error);
      setIsListening(false);
      
      let errorMsg = 'Error en el reconocimiento de voz';
      if (event.error === 'no-speech') {
        errorMsg = 'No se detectó voz. Intenta de nuevo.';
      } else if (event.error === 'not-allowed') {
        errorMsg = 'Permiso de micrófono denegado. Actívalo en la configuración del navegador.';
      }
      
      alert(errorMsg);
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('🎤 Reconocimiento finalizado');
    };

    recognition.start();
  };

  const quickCommands = [
    'Mostrar stock',
    'Alertas de stock bajo',
    'Análisis de precios',
    'Estado de órdenes',
    'Mejor producto',
    'Recomendar compra'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">Asistente IA</h3>
            <p className="text-sm mt-1 opacity-90">Chat y comandos de voz</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 rounded p-2 transition"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {aiMessages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 shadow'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
                {message.role === 'assistant' && (
                  <button
                    onClick={() => speakResponse(message.content)}
                    className="text-xs opacity-70 hover:opacity-100 ml-2 flex items-center gap-1"
                    title="Leer en voz alta"
                  >
                    <Volume2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Commands */}
      <div className="border-t p-4 bg-white">
        <p className="text-xs text-gray-600 mb-2 font-semibold">⚡ Comandos rápidos:</p>
        <div className="flex flex-wrap gap-2">
          {quickCommands.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => sendAIMessage(cmd)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-white space-y-3">
        <button 
          onClick={handleVoiceCommand}
          className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 transition ${
            isListening 
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          <Mic size={20} />
          {isListening ? '🔴 Escuchando...' : '🎤 Activar Comando de Voz'}
        </button>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Escribe tu consulta o di 'ayuda'..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button 
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            <Send size={20} />
          </button>
        </div>
        
        <p className="text-xs text-gray-500 text-center">
          💡 Sistema inteligente 100% funcional • Preparado para IA real
        </p>
      </div>
    </div>
  );
};