import React, { useState } from 'react';
import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebaseConfig';


// firebase.initializeApp(firebaseConfig);

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

function App() {

  const [newUser, setNewUser] = useState(false);

  const [user, setUser] = useState({
    isSignedIn: false,
    isFbSignIn: false,
    name: "",
    photo: "",
    email: "",
    password: "",
    isFieldValid: false
  })

  const googleProvider = new firebase.auth.GoogleAuthProvider();

  const fbProvider = new firebase.auth.FacebookAuthProvider();

  const handleSignIn = () => {
    firebase.auth().signInWithPopup(googleProvider)
      .then(result => {
        const { displayName, email, photoURL } = result.user;
        const signedInUser = {
          isSignedIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(signedInUser);
        // console.log(signedInUser);
      })
      .catch(error => {
        console.log(error);
        console.log(error.message);
      })
  }

  const handleFbSignIn = () => {
    firebase.auth().signInWithPopup(fbProvider)
    .then(result => {
      const { displayName, email, photoURL } = result.user;
      const signedInUser = {
        isFbSignIn: true,
        name: displayName,
        email: email,
        photo: photoURL
      }
      setUser(signedInUser);

    }).catch(error => {
      // Handle Errors here.
      const errorMessage = error.message;
      console.log(errorMessage);
    });
  }

  const handleSignOut = () => {
    firebase.auth().signOut()
      .then(result => {
        const signedOutUser = {
          isSignedIn: false,
          name: "",
          email: "",
          password: "",
          error: "",
          photo: "",
          isFieldValid: false,
          existingUser: false,
          success: false
        }
        setUser(signedOutUser);
      })
      .catch(error => {
        console.log(error);
        console.log(error.message);
      })
  }

  const handleFbSignOut = () => {
    firebase.auth().signOut()
    .then(result => {
      const signedOutUser = {
        isFbSignIn: false,
        name: "",
        email: "",
        password: "",
        error: "",
        photo: "",
        isFieldValid: false,
        existingUser: false,
        success: false
      }
      setUser(signedOutUser);
    })
    .catch(error => {
      console.log(error);
      console.log(error.message);
    });
  }

  const is_valid_email = email => /(.+)@(.+){2,}\.(.+){2,}/.test(email);
  const hasNumber = input => /\d/.test(input);

  const handleBlur = (e) => {

    let isFieldValid = true;
    if (e.target.name === "email") {
      isFieldValid = is_valid_email(e.target.value);
    }

    if (e.target.name === "password") {
      isFieldValid = e.target.value.length > 6 && hasNumber(e.target.value);
    }

    if (isFieldValid) {
      const newUserInfo = { ...user };
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    }

  }

  const handleSubmit = (e) => {
    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = "";
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName(user.name);
        })
        .catch(error => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }

    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo = { ...user };
          newUserInfo.error = "";
          newUserInfo.success = true;
          setUser(newUserInfo);
          console.log("sign in Userinfo",res.user);
        })
        .catch(error => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }

    e.preventDefault();
    e.target.reset();
  }

  const updateUserName = name => {

    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    }).then(function () {
      console.log("Update successful.")
    }).catch(error => {
      console.log(error)
    });
  }

  return (
    <div className="App">
      <div>
        {
          user.isSignedIn ? <button onClick={handleSignOut}>Sign Out</button> :
            <button onClick={handleSignIn}>Sign in with Google</button>
        }
        <br/>
        {
          user.isSignedIn ? <button onClick={handleFbSignOut}>Sign Out</button> :
          <button onClick={handleFbSignIn}>Sign in with FaceBook</button>
        }

        {
          user.isSignedIn &&
          <div>
            <p>Hi, {user.name}</p>
            <p>Your Email: {user.email}</p>
            <p>Your Password: {user.password}</p>
            <img src={user.photo} alt="" />
          </div>
        }
      </div>
      <h1>Our Own authentication</h1>
      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
      <label htmlFor="newUser">New User SignUp</label>
      <form onSubmit={handleSubmit}>
        {
          newUser && <input type="text" onBlur={handleBlur} name="name" id="" placeholder="Your name" required />
        }
        <br />
        <input type="text" onBlur={handleBlur} name="email" id="" placeholder="Your Email" required />
        <br />
        <input type="password" onBlur={handleBlur} name="password" id="" placeholder="Password" required />
        <br />
        <input type="submit" value={newUser ? "Sign Up" : "Sign In"} />
      </form>
      <p style={{ color: 'red' }}>{user.error}</p>
      {
        user.success && <p style={{ color: 'green' }}>User {newUser ? "created" : "log In"} Successfully</p>
      }
    </div>
  );
}

export default App;

