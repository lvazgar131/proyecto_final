const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");



// Definir el esquema de Contactos
const ContactosSchema = new Schema({
    nombre: {
        type: String,
        required: [true, "El nombre es obligatorio"],
        trim: true,
        validate: {
            validator: function(value) {
                return /^[a-zA-Z\s]+$/.test(value); // Solo letras y espacios
            },
            message: "El nombre solo puede contener letras y espacios"
        }
    },
    username: {
        type: String,
        required: [true, "El nombre de usuario es obligatorio"],
        unique: true,
        trim: true,
        minlength: [3, "El nombre de usuario debe tener al menos 3 caracteres"],
        lowercase: true,
    },
    email: {
        type: String,
        required: [true, "El correo electrónico es obligatorio"],
        unique: true,
        lowercase: true,
    },
    fecha_creacion: {
        type: String,
        default: function() {
            return new Date().toLocaleString('es-ES', {
                timeZone: 'Europe/Madrid',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false // Formato 24 horas
            });
        }
    },
    foto: {
        type: String,
        default: "imagen_anonimous.png"
    },
    password: {
        type: String,
        required: [true, "La contraseña es obligatoria"],
        minlength: [6, "La contraseña debe tener al menos 6 caracteres"]
    },
    ult_conexion: {
        type: String,
        default: "No se ha accedido nunca"
    },
    minutos_conectados: {
        type: Number,
        default: 0, // Inicializar en 0 minutos
        validate: {
            validator: function(value) {
                return value >= 0; // Validar que no sea negativo
            },
            message: "Los minutos conectados no pueden ser negativos"
        }
    },
    
});


// `pre-save` es para encriptar la contraseña antes de guardar (se podrian meter mas cosas). this se refiere a la propia instacia de la clase modelo.
ContactosSchema.pre("save", async function(next) {
    if (this.isModified("password")) { //Is Modified me detecta automaticamente si yo ya he hecho algún cambio en mi función de callback, lo cual es muyyyyy útil
        this.password = await bcrypt.hash(this.password, 10);
    }
    next(); //Los usos de middlewares requieren de next aveces, como por ejemplo la funcion de callback en el middleware de borrar usuario
});


// Método de instancia para comparar contraseñas
ContactosSchema.methods.comparePassword = async function(password) { //con metod creo el método que a mi me de la gana
    return await bcrypt.compare(password, this.password);
};


const ActivitiesSchema = new Schema({
    Tema: {
        type: String,
        required: [true, "El Tema es obligatorio"],
        trim: true,
    },
    Color: {
        type: String,
        required: [true, "El color de la actividad es obligatorio"],
        default: "black",
    },
    Actividad: {
        type: String,
        required: [true, "El nombre de la actividad es obligatorio"],
    },
    Fecha_fin: {
        type: String,
        required: [true, "La fecha de finalizacion es obligatoria"],
    },
    Fecha_creación: {
        type: String,
        required: [true, "La fecha de creacion es obligatoria"],
    },
    Abreviacion: {
        type: String,
        required: [true, "La abreviacion de la actividad es obligatoria"],
    },
    Explicacion: {
        type: String,
        required: [true, "La explicacion de la actividad es obligatoria"],
    },
});


async function crearActividadSiNoHay() {
    try {
        const total = await Actividades.countDocuments();

        // Si no hay actividades, crear una por defecto
        if (total === 0) {

            const fechaCreacion = new Date().toLocaleString("es-ES", {
                timeZone: "Europe/Madrid",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            });

            const actividad = new Actividades({
                Tema: "General",
                Color: "black",
                Actividad: "Primera actividad automática",
                Fecha_fin: "31/12/2099 23:59:59",
                Fecha_creación: fechaCreacion,
                Abreviacion: "PAA",
                Explicacion: "Actividad creada automáticamente por el sistema al detectar que no había ninguna."
            });

            await actividad.save();

            console.log("Actividad creada automáticamente:", actividad);
            return actividad;
        }

        console.log("Ya existen actividades, no se crea ninguna.");
        return null;

    } catch (error) {
        console.error("Error al verificar o crear la actividad:", error);
        throw error;
    }
}




const EntregasSchema = new Schema({
    username: {
        type: String,
        required: [true, "El nombre de usuario es obligatorio"],
        trim: true,
        minlength: [3, "El nombre de usuario debe tener al menos 3 caracteres"],
    },
    Tema: {
        type: String,
        required: [true, "El Tema es obligatorio"],
        trim: true,
    },
    Actividad: {
        type: String,
        required: [true, "El nombre de la actividad es obligatorio"],
    },
    Fecha_entrega: {
        type: String,
        required: [true, "La fecha de entrega es obligatoria"],
    },
    Comentarios: {
        type: String,
        required: [true, "El comentario es obligatorio"],
        minlength: [1, "El comentario debe tener al menos 3 caracteres"],
        maxlength: [1000, "No se pueden superar los 1000 caracteres en el comentario"],
    },
    Nombre_archivo: {
        type: String,
        required: [true, "El nombre del es obligatorio"],
    }
});



const MensajesSchema = new Schema({
    username: {
        type: String,
        required: [true, "El nombre de usuario es obligatorio"],
        trim: true,
        minlength: [3, "El nombre de usuario debe tener al menos 3 caracteres"],
    },
    texto: {
        type: String,
        required: [true, "El texto es obligatorio"],
        minlength: [1, "El texto debe tener al menos 1 caracter"],
        maxlength: [1000, "No se pueden superar los 1000 caracteres"],
    },
    fecha_anuncio: {
        type: String,
        required: [true, "El nombre de la fecha_anuncio es obligatoria"]
    },
    likes: {
        type: [String],  // array de usernames que dieron like
        default: []
    },
    respuestas: {
        type: [
            {
            username: { type: String, required: true },
            texto: { type: String, required: true, maxlength: 1000 },
            fecha_respuesta: { type: String, required: true },
            likes: {
                type: [String],  // usuarios que dieron like a la respuesta
                default: []
            }
            }
        ],
        default: []
        }
});


const Usuarios = model("Usuarios", ContactosSchema, "Users");
const Actividades = model("Actividades", ActivitiesSchema, "Activities");
const Actividades_entregadas = model("Actividades_entregadas", EntregasSchema, "Activities_recieved");
const Mensajes = model("Mensajes", MensajesSchema, "Messages");


async function initDB() {
    try {
        // Definir una sola vez
        const fecha = new Date().toLocaleString("es-ES", {
            timeZone: "Europe/Madrid",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        });

        // Usuarios
        if (await Usuarios.countDocuments() === 0) {
            const user = new Usuarios({
                nombre: "Juan Perez",
                username: "juanp",
                email: "juanp@example.com",
                password: "123456",
                ult_conexion: "No se ha accedido nunca",
                minutos_conectados: 0
            });

            await user.save();
            console.log("✔ Usuario de ejemplo creado.");
        }

        // Actividades
        if (await Actividades.countDocuments() === 0) {
            await Actividades.create({
                Tema: "Programación",
                Color: "blue",
                Actividad: "Crear API con Node.js",
                Fecha_fin: "30/12/2025 23:59:59",
                Fecha_creación: fecha,
                Abreviacion: "API",
                Explicacion: "Actividad para crear una API REST usando Express y MongoDB."
            });
            console.log("✔ Actividad de ejemplo creada.");
        }

        // Entregas
        if (await Actividades_entregadas.countDocuments() === 0) {
            await Actividades_entregadas.create({
                username: "juanp",
                Tema: "Programación",
                Actividad: "Crear API con Node.js",
                Fecha_entrega: fecha,
                Comentarios: "Entrega inicial",
                Nombre_archivo: "api_proyecto.zip"
            });
            console.log("✔ Entrega de ejemplo creada.");
        }

        // Mensajes
        if (await Mensajes.countDocuments() === 0) {
            await Mensajes.create({
                username: "juanp",
                texto: "¡Hola a todos! Ya está disponible la nueva actividad 📌",
                fecha_anuncio: fecha,
                likes: ["maria", "carlos"],
                respuestas: [
                    {
                        username: "maria",
                        texto: "Gracias por avisar!",
                        fecha_respuesta: fecha,
                        likes: ["juanp"]
                    }
                ]
            });
            console.log("✔ Mensaje inicial creado.");
        }

    } catch (err) {
        console.error("❌ Error inicializando la BD:", err);
    }
}


module.exports = { Usuarios, Actividades, Actividades_entregadas,Mensajes, crearActividadSiNoHay, initDB};







