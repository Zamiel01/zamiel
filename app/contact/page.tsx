"use client";

import { FaPhone, FaEnvelope, FaLocationDot } from "react-icons/fa6";

export default function Contact() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-center px-6 lg:px-24 py-12">
      <div className="contact-info-panel">
        <h1>Let's Work Together</h1>
        <p className="intro">
          I'm currently looking for new project opportunities or full-time roles. If you have an inquiry, technical proposition, or just want to say hi, feel free to drop a line!
        </p>

        <div className="info-cards-stack">
          <div className="info-card-item">
            <div className="info-icon-wrapper">
              <FaPhone />
            </div>
            <div className="info-details-box">
              <div className="label-title">Phone</div>
              <div className="actual-data">+237 678-677-213</div>
            </div>
          </div>

          <div className="info-card-item">
            <div className="info-icon-wrapper">
              <FaEnvelope />
            </div>
            <div className="info-details-box">
              <div className="label-title">Email</div>
              <div className="actual-data">nkuinmbeng@gmail.com</div>
            </div>
          </div>

          <div className="info-card-item">
            <div className="info-icon-wrapper">
              <FaLocationDot />
            </div>
            <div className="info-details-box">
              <div className="label-title">Address</div>
              <div className="actual-data">Douala, Cameroon</div>
            </div>
          </div>
        </div>
      </div>

      <div className="contact-card-wrapper">
        <h2>
          Contact <span>Me!</span>
        </h2>

        <form action="#" method="POST" className="contact-form-element">
          <div className="input-fields-row">
            <input type="text" name="name" placeholder="Full Name" required />
            <input type="email" name="email" placeholder="Email Address" required />
          </div>

          <div className="input-fields-row">
            <input type="tel" name="phone" placeholder="Phone Number" />
            <input type="text" name="subject" placeholder="Email Subject" />
          </div>

          <textarea name="message" rows={6} placeholder="Your Message" required />

          <div className="submit-action-container">
            <button type="submit" className="btn-submit-message">
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
