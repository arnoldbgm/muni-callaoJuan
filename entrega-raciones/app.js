// registros.js

let envioEnProceso = false;

function getBeneficiariosFromStorage() {
    try {
        const beneficiarios = localStorage.getItem('beneficiarios');
        return beneficiarios ? JSON.parse(beneficiarios) : [];
    } catch (error) {
        console.error('Error al leer beneficiarios del localStorage:', error);
        return [];
    }
}

function establecerComedor(comedor) {
    const comedorSelect = document.getElementById('comedor');
    let opcionExiste = Array.from(comedorSelect.options).some(opt => opt.value === comedor);
    if (!opcionExiste && comedor) {
        const option = document.createElement('option');
        option.value = comedor;
        option.textContent = comedor;
        comedorSelect.appendChild(option);
    }
    comedorSelect.value = comedor || '';
}

function limpiarCampos() {
    document.getElementById('nombre').value = '';
    document.getElementById('comedor').value = '';
    document.querySelectorAll('[id$="-error"]').forEach(el => {
        el.textContent = '';
        el.classList.add('hidden');
    });
    document.querySelectorAll('input, select').forEach(input => {
        input.classList.remove('border-green-500', 'border-red-500');
    });
}

function mostrarEstado(elemento, mensaje, esExito = false) {
    const errorElement = document.getElementById(elemento + '-error');
    if (errorElement) {
        errorElement.textContent = mensaje;
        errorElement.classList.remove('hidden');
        errorElement.className = esExito ? 'text-green-600 text-xs' : 'text-red-500 text-xs';
    }
}

function estilizarCampo(elementId, esValido) {
    const elemento = document.getElementById(elementId);
    if (elemento) {
        elemento.classList.remove('border-green-500', 'border-red-500');
        elemento.classList.add(esValido ? 'border-green-500' : 'border-red-500');
    }
}

function guardarRegistroEntrega(datosEntrega) {
    try {
        const { dni, nombre, tipoRacion, comedor } = datosEntrega;
        if (!dni || !nombre || !tipoRacion || !comedor) {
            console.warn('❌ Registro ignorado por campos vacíos:', datosEntrega);
            return false;
        }

        const entregas = JSON.parse(localStorage.getItem('entregas')) || [];
        const nuevaEntrega = {
            id: Date.now(),
            dni,
            nombre,
            tipoDeRacion: tipoRacion,
            comedor,
            fecha: new Date().toLocaleDateString('es-PE'),
            hora: new Date().toLocaleTimeString('es-PE')
        };

        entregas.push(nuevaEntrega);
        console.log(nuevaEntrega)
        localStorage.setItem('entregas', JSON.stringify(entregas));
        console.log('✅ Entrega registrada:', nuevaEntrega);
        return true;
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formRaciones');
    const dniInput = document.getElementById('dni');

    dniInput.addEventListener('keyup', () => {
        const dni = dniInput.value.trim();
        if (dni.length < 8) {
            limpiarCampos();
            return;
        }

        const beneficiarios = getBeneficiariosFromStorage();
        const beneficiario = beneficiarios.find(b => b.dni === dni);

        if (beneficiario) {
            const nombreCompleto = `${beneficiario.nombre} ${beneficiario.apellidos}`.toUpperCase();
            document.getElementById('nombre').value = nombreCompleto;
            establecerComedor(beneficiario.comedor);
            mostrarEstado('dni', '✓ Beneficiario encontrado', true);
            estilizarCampo('dni', true);
            estilizarCampo('nombre', true);
            estilizarCampo('comedor', true);
        } else {
            limpiarCampos();
            mostrarEstado('dni', 'Beneficiario no registrado en el sistema');
            estilizarCampo('dni', false);
        }
    });

    dniInput.addEventListener('blur', () => {
        const dni = dniInput.value.trim();
        if (dni.length > 0 && dni.length < 8) {
            mostrarEstado('dni', 'El DNI debe tener al menos 8 dígitos');
            estilizarCampo('dni', false);
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (envioEnProceso) return;
        envioEnProceso = true;

        const dni = document.getElementById('dni').value.trim();
        const nombre = document.getElementById('nombre').value.trim();
        const tipoRacion = document.getElementById('tipoDeRacion').value;
        const comedor = document.getElementById('comedor').value;

        if (!dni || dni.length < 8 || !nombre || !tipoRacion || !comedor) {
            alert('❌ Todos los campos son obligatorios y el DNI debe tener 8 dígitos.');
            envioEnProceso = false;
            return;
        }

        const beneficiarios = getBeneficiariosFromStorage();
        const beneficiario = beneficiarios.find(b => b.dni === dni);

        if (beneficiario) {
            const nombreCompleto = `${beneficiario.nombre} ${beneficiario.apellidos}`.toUpperCase();
            if (nombre.toUpperCase() === nombreCompleto) {
                const ok = guardarRegistroEntrega({ dni, nombre, tipoRacion, comedor });
                if (ok) {
                    alert(`✅ ENTREGA REGISTRADA\nBeneficiario: ${nombre}\nDNI: ${dni}\nTipo: ${tipoRacion}\nComedor: ${comedor}`);
                    form.reset();
                    limpiarCampos();
                } else {
                    alert('❌ Error al guardar. Intente nuevamente.');
                }
            } else {
                alert('❌ El nombre no coincide con el DNI ingresado.');
            }
        } else {
            alert('❌ El beneficiario no está registrado.');
        }

        envioEnProceso = false;
    });

    document.getElementById('btnLimpiar').addEventListener('click', () => {
        form.reset();
        limpiarCampos();
        dniInput.focus();
    });

    dniInput.focus();
});
