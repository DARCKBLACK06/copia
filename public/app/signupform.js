import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js"
import { auth } from './firebase.js'
import { showMessage } from './showMessage.js'

const signupform = document.querySelector('#signup-form')

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = signupform['login-email'].value
    const password = signupform['login-password'].value

    console.log(email, password)

    try {    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    console.log(userCredential)

    // Ocultar modal de registro
    const signupModal = document.querySelector('#signupModal')
    const modal = bootstrao.Modal.getInstance(signupModal)
    modal.hide()

    showMessage('Registro exitoso' + userCredential.user.email) 

    } catch (error) {
        if (error.code === 'auth/invalid-email') {
            showMessage("Correo no válido","error")
        }else if (error.code === 'auth/weak-password') {
            showMessage("Contraseña demasiado débil","error")
        }else if (error.code === 'auth/email-already-in-use') {
            showMessage("Correo ya en uso","error")
        }else if (error.code) {
            showMessage("Error inesperado","error")
        }   
    }

})