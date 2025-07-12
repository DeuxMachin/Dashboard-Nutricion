import React, { useState, useEffect } from 'react';
import { validateClienteData, sanitizeInput } from '../../utils/security';
import type { Cliente } from '../../types/index';

interface NuevoPacienteFormProps {
  onSubmit: (data: Partial<Cliente>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export const NuevoPacienteForm: React.FC<NuevoPacienteFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Cliente>>({
    nombre: '',
    apellido: '',
    rut: '',
    correo: '',
    telefono: '',
    fecha_nacimiento: '',
    genero: undefined,
    altura: undefined,
    peso: undefined,
    peso_objetivo: undefined,
    alergias: [],
    condiciones_medicas: [],
    tratamientos: [],
    objetivos: '',
    progreso: 'Pendiente'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [tempValues, setTempValues] = useState({
    alergia: '',
    condicion: '',
    tratamiento: ''
  });

  const alergiasComunes = [
    'Lácteos', 'Gluten', 'Frutos secos', 'Mariscos', 'Huevo', 
    'Soja', 'Pescado', 'Apio', 'Mostaza', 'Sésamo'
  ];

  const condicionesMedicasComunes = [
    'Diabetes', 'Hipertensión', 'Colesterol alto', 'Obesidad', 
    'Hipotiroidismo', 'Síndrome metabólico', 'Gastritis', 'Colon irritable'
  ];

  const tratamientosComunes = [
    'Pérdida de peso', 'Control glucémico', 'Reducción colesterol',
    'Control presión arterial', 'Ganancia masa muscular', 'Nutrición deportiva'
  ];

  const steps = [
    { number: 1, title: 'Información Personal', icon: '👤' },
    { number: 2, title: 'Datos Físicos', icon: '📏' },
    { number: 3, title: 'Historial Médico', icon: '🏥' },
    { number: 4, title: 'Objetivos', icon: '🎯' }
  ];

  useEffect(() => {
    setErrors({});
    setGeneralError('');
  }, [currentStep]);

  const checkDataIntegrity = (data: any): boolean => {
    try {
      const jsonString = JSON.stringify(data);
      const maliciousPatterns = [
        /<script/i, /javascript:/i, /on\w+=/i, /data:text\/html/i, /vbscript:/i
      ];
      return !maliciousPatterns.some(pattern => pattern.test(jsonString));
    } catch {
      return false;
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1:
        if (!formData.nombre?.trim()) newErrors.nombre = 'El nombre es obligatorio';
        if (!formData.apellido?.trim()) newErrors.apellido = 'El apellido es obligatorio';
        if (!formData.rut?.trim()) {
          newErrors.rut = 'El RUT es obligatorio';
        } else {
          const rutLimpio = formData.rut.replace(/[\s.-]/g, '');
          if (rutLimpio.length < 7) {
            newErrors.rut = 'El RUT debe tener al menos 7 caracteres';
          } else if (!/^[0-9]+[0-9kK]$/.test(rutLimpio)) {
            newErrors.rut = 'El RUT tiene un formato inválido';
          }
        }
        if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
          newErrors.correo = 'El correo debe tener un formato válido';
        }
        break;
      case 2:
        if (formData.altura && (formData.altura < 50 || formData.altura > 250)) {
          newErrors.altura = 'La altura debe estar entre 50 y 250 cm';
        }
        if (formData.peso && (formData.peso < 20 || formData.peso > 300)) {
          newErrors.peso = 'El peso debe estar entre 20 y 300 kg';
        }
        if (formData.peso_objetivo && (formData.peso_objetivo < 20 || formData.peso_objetivo > 300)) {
          newErrors.peso_objetivo = 'El peso objetivo debe estar entre 20 y 300 kg';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let sanitizedValue = sanitizeInput(value);
    
    // Formateo especial para RUT
    if (name === 'rut') {
      // Solo permitir números, puntos, guiones y letra K/k
      let cleanValue = value.replace(/[^0-9kK.-]/g, '');
      
      // Formatear automáticamente solo si es un RUT válido
      if (cleanValue.length >= 7) {
        // Remover puntos y guiones existentes para reformatear
        const digitsOnly = cleanValue.replace(/[\.-]/g, '');
        
        if (digitsOnly.length >= 7 && digitsOnly.length <= 9) {
          // Formatear como XXXXXXXX-X
          const numbers = digitsOnly.slice(0, -1); 
          const dv = digitsOnly.slice(-1); 
          
          // Por ahora, formato simple sin puntos
          sanitizedValue = numbers + '-' + dv;
        } else {
          sanitizedValue = cleanValue;
        }
      } else {
        sanitizedValue = cleanValue;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayField = (field: 'alergias' | 'condiciones_medicas' | 'tratamientos', value: string) => {
    if (!value.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()]
    }));
  };

  const removeArrayItem = (field: 'alergias' | 'condiciones_medicas' | 'tratamientos', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || []
    }));
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!checkDataIntegrity(formData)) {
        throw new Error('Los datos del formulario no son seguros');
      }

      for (let i = 1; i <= steps.length; i++) {
        if (!validateStep(i)) {
          setCurrentStep(i);
          return;
        }
      }

      // Solo enviar los campos que existen en la tabla cliente
      const dataToSubmit = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        rut: formData.rut,
        correo: formData.correo || undefined,
        telefono: formData.telefono || undefined,
        fecha_nacimiento: formData.fecha_nacimiento || undefined,
        genero: formData.genero || undefined,
        altura: formData.altura || undefined,
        peso: formData.peso || undefined,
        peso_objetivo: formData.peso_objetivo || undefined,
        alergias: formData.alergias || [],
        condiciones_medicas: formData.condiciones_medicas || [],
        tratamientos: formData.tratamientos || [],
        objetivos: formData.objetivos || undefined,
        progreso: formData.progreso || 'Pendiente'
      };

      await onSubmit(dataToSubmit);
      
    } catch (error: any) {
      setGeneralError(error.message || 'Error al crear el paciente');
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className={`flex items-center ${currentStep >= step.number ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2
              ${currentStep >= step.number 
                ? 'bg-green-600 text-white border-green-600' 
                : 'bg-white text-gray-400 border-gray-300'
              }
            `}>
              {currentStep > step.number ? '✓' : step.number}
            </div>
            <div className="ml-3 hidden sm:block">
              <div className="text-xs font-medium">{step.title}</div>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`
              w-12 h-0.5 mx-4
              ${currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'}
            `} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
        <p className="text-sm text-gray-600">Datos básicos del paciente</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre || ''}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.nombre ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Ingresa el nombre"
            disabled={isLoading}
          />
          {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
        </div>

        <div>
          <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-2">
            Apellido *
          </label>
          <input
            type="text"
            id="apellido"
            name="apellido"
            value={formData.apellido || ''}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.apellido ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Ingresa el apellido"
            disabled={isLoading}
          />
          {errors.apellido && <p className="mt-1 text-sm text-red-600">{errors.apellido}</p>}
        </div>

        <div>
          <label htmlFor="rut" className="block text-sm font-medium text-gray-700 mb-2">
            RUT *
          </label>
          <input
            type="text"
            id="rut"
            name="rut"
            value={formData.rut || ''}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.rut ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="12.345.678-9"
            disabled={isLoading}
          />
          {errors.rut && <p className="mt-1 text-sm text-red-600">{errors.rut}</p>}
        </div>

        <div>
          <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Nacimiento
          </label>
          <input
            type="date"
            id="fecha_nacimiento"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="correo"
            name="correo"
            value={formData.correo || ''}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.correo ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="correo@ejemplo.com"
            disabled={isLoading}
          />
          {errors.correo && <p className="mt-1 text-sm text-red-600">{errors.correo}</p>}
        </div>

        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="+56 9 1234 5678"
            disabled={isLoading}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="genero" className="block text-sm font-medium text-gray-700 mb-2">
            Género
          </label>
          <select
            id="genero"
            name="genero"
            value={formData.genero || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={isLoading}
          >
            <option value="">Seleccionar género</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Datos Físicos</h3>
        <p className="text-sm text-gray-600">Medidas y objetivos físicos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="altura" className="block text-sm font-medium text-gray-700 mb-2">
            Altura (cm)
          </label>
          <input
            type="number"
            id="altura"
            name="altura"
            value={formData.altura || ''}
            onChange={handleChange}
            min="50"
            max="250"
            step="0.1"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.altura ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="170"
            disabled={isLoading}
          />
          {errors.altura && <p className="mt-1 text-sm text-red-600">{errors.altura}</p>}
        </div>

        <div>
          <label htmlFor="peso" className="block text-sm font-medium text-gray-700 mb-2">
            Peso Actual (kg)
          </label>
          <input
            type="number"
            id="peso"
            name="peso"
            value={formData.peso || ''}
            onChange={handleChange}
            min="20"
            max="300"
            step="0.1"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.peso ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="70"
            disabled={isLoading}
          />
          {errors.peso && <p className="mt-1 text-sm text-red-600">{errors.peso}</p>}
        </div>

        <div>
          <label htmlFor="peso_objetivo" className="block text-sm font-medium text-gray-700 mb-2">
            Peso Objetivo (kg)
          </label>
          <input
            type="number"
            id="peso_objetivo"
            name="peso_objetivo"
            value={formData.peso_objetivo || ''}
            onChange={handleChange}
            min="20"
            max="300"
            step="0.1"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.peso_objetivo ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="65"
            disabled={isLoading}
          />
          {errors.peso_objetivo && <p className="mt-1 text-sm text-red-600">{errors.peso_objetivo}</p>}
        </div>

        {formData.altura && formData.peso && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">IMC Calculado</h4>
            <p className="text-2xl font-bold text-blue-600">
              {((formData.peso / ((formData.altura / 100) ** 2))).toFixed(1)}
            </p>
            <p className="text-xs text-blue-700">
              {(() => {
                const imc = formData.peso / ((formData.altura / 100) ** 2);
                if (imc < 18.5) return 'Bajo peso';
                if (imc < 25) return 'Peso normal';
                if (imc < 30) return 'Sobrepeso';
                return 'Obesidad';
              })()}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Historial Médico</h3>
        <p className="text-sm text-gray-600">Alergias, condiciones médicas y tratamientos</p>
      </div>

      <div className="space-y-6">
        {/* Alergias Alimentarias */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Alergias Alimentarias
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {alergiasComunes.map((alergia) => (
              <button
                key={alergia}
                type="button"
                onClick={() => handleArrayField('alergias', alergia)}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={formData.alergias?.includes(alergia) || isLoading}
              >
                + {alergia}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tempValues.alergia}
              onChange={(e) => setTempValues(prev => ({ ...prev, alergia: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Agregar otra alergia..."
              disabled={isLoading}
              maxLength={50}
            />
            <button
              type="button"
              onClick={() => {
                handleArrayField('alergias', tempValues.alergia);
                setTempValues(prev => ({ ...prev, alergia: '' }));
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!tempValues.alergia.trim() || isLoading}
            >
              Agregar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.alergias?.map((alergia, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full"
              >
                {alergia}
                <button
                  type="button"
                  onClick={() => removeArrayItem('alergias', index)}
                  className="ml-2 text-red-600 hover:text-red-800 focus:outline-none"
                  disabled={isLoading}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Condiciones Médicas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Condiciones Médicas
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {condicionesMedicasComunes.map((condicion) => (
              <button
                key={condicion}
                type="button"
                onClick={() => handleArrayField('condiciones_medicas', condicion)}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={formData.condiciones_medicas?.includes(condicion) || isLoading}
              >
                + {condicion}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tempValues.condicion}
              onChange={(e) => setTempValues(prev => ({ ...prev, condicion: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Agregar otra condición médica..."
              disabled={isLoading}
              maxLength={50}
            />
            <button
              type="button"
              onClick={() => {
                handleArrayField('condiciones_medicas', tempValues.condicion);
                setTempValues(prev => ({ ...prev, condicion: '' }));
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!tempValues.condicion.trim() || isLoading}
            >
              Agregar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.condiciones_medicas?.map((condicion, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
              >
                {condicion}
                <button
                  type="button"
                  onClick={() => removeArrayItem('condiciones_medicas', index)}
                  className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                  disabled={isLoading}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Tratamientos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tratamientos Objetivo
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {tratamientosComunes.map((tratamiento) => (
              <button
                key={tratamiento}
                type="button"
                onClick={() => handleArrayField('tratamientos', tratamiento)}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={formData.tratamientos?.includes(tratamiento) || isLoading}
              >
                + {tratamiento}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tempValues.tratamiento}
              onChange={(e) => setTempValues(prev => ({ ...prev, tratamiento: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Agregar otro tratamiento..."
              disabled={isLoading}
              maxLength={50}
            />
            <button
              type="button"
              onClick={() => {
                handleArrayField('tratamientos', tempValues.tratamiento);
                setTempValues(prev => ({ ...prev, tratamiento: '' }));
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!tempValues.tratamiento.trim() || isLoading}
            >
              Agregar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tratamientos?.map((tratamiento, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full"
              >
                {tratamiento}
                <button
                  type="button"
                  onClick={() => removeArrayItem('tratamientos', index)}
                  className="ml-2 text-green-600 hover:text-green-800 focus:outline-none"
                  disabled={isLoading}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Objetivos Nutricionales</h3>
        <p className="text-sm text-gray-600">Metas y observaciones del tratamiento</p>
      </div>

      <div>
        <label htmlFor="objetivos" className="block text-sm font-medium text-gray-700 mb-2">
          Objetivos del Tratamiento
        </label>
        <textarea
          id="objetivos"
          name="objetivos"
          value={formData.objetivos || ''}
          onChange={handleChange}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Describe los objetivos nutricionales del paciente...&#10;&#10;Ejemplo:&#10;- Reducir peso de forma gradual&#10;- Mejorar hábitos alimentarios&#10;- Controlar niveles de glucosa"
          disabled={isLoading}
          maxLength={500}
        />
        <div className="mt-1 text-xs text-gray-500 text-right">
          {(formData.objetivos || '').length}/500 caracteres
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Resumen del Paciente</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><span className="font-medium">Nombre:</span> {formData.nombre} {formData.apellido}</p>
            <p><span className="font-medium">RUT:</span> {formData.rut}</p>
            <p><span className="font-medium">Correo:</span> {formData.correo || 'No especificado'}</p>
            <p><span className="font-medium">Género:</span> {formData.genero || 'No especificado'}</p>
            <p><span className="font-medium">Alergias:</span> {formData.alergias?.length ? formData.alergias.length : 'Ninguna'}</p>
          </div>
          <div>
            <p><span className="font-medium">Altura:</span> {formData.altura ? `${formData.altura} cm` : 'No especificada'}</p>
            <p><span className="font-medium">Peso actual:</span> {formData.peso ? `${formData.peso} kg` : 'No especificado'}</p>
            <p><span className="font-medium">Peso objetivo:</span> {formData.peso_objetivo ? `${formData.peso_objetivo} kg` : 'No especificado'}</p>
            <p><span className="font-medium">Condiciones médicas:</span> {formData.condiciones_medicas?.length ? formData.condiciones_medicas.length : 'Ninguna'}</p>
            <p><span className="font-medium">Tratamientos:</span> {formData.tratamientos?.length ? formData.tratamientos.length : 'Ninguno'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nuevo Paciente</h2>
            <p className="text-gray-600">Registra un nuevo paciente en el sistema</p>
          </div>
        </div>

        {renderStepIndicator()}

        {generalError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {renderCurrentStep()}

          <div className="flex justify-between pt-8 mt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={currentStep === 1 || isLoading}
            >
              Anterior
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                  disabled={isLoading}
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creando...' : 'Crear Paciente'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
