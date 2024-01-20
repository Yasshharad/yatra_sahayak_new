import emailjs from '@emailjs/browser';
import React, { useRef } from "react";
import styled from "styled-components";

const Feedback = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.sendForm('service_dtzqi7e', 'template_a3rz34d', form.current, 'WDOP8NwhYsPkW9i3U')
      .then((result) => {
        console.log(result.text);
        console.log("message sent")
      }, (error) => {
        console.log(error.text);
      });
  };

  return (
    <StyledContactForm>
      <form ref={form} onSubmit={sendEmail}>
        <h2>Feedback</h2>
        <label>Name</label>
        <input type="text" name="user_name" />
        <label>Email</label>
        <input type="email" name="user_email" />
        <label>Message</label>
        <textarea name="message" />
        <button type="submit">Send</button>
      </form>
    </StyledContactForm>
  );
}

// Styles
const StyledContactForm = styled.div`
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 0 20px rgb(255, 174, 174);
  background-color: #fff;

  h2 {
    text-align: center;
    color: #ec726d;
  }

  form {
    display: flex;
    flex-direction: column;
  }

  label {
    margin: 10px 0;
    color: #555;
  }

  input {
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
    outline: none;
  }

  textarea {
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    border: 1px solid #ccc;
    border-radius: 5px;
    outline: none;
  }

  button {
    background-color: #ec726d;
    color: #fff;
    border: none;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
  }

  button:hover {
    background-color: #ff4c46;
  }
`;

export default Feedback;
