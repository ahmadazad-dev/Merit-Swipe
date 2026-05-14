import { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiSend } from "react-icons/fi";
import styles from "./styles/contact.module.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Message Sent:", formData);
    setStatus("success");
    setFormData({ name: "", email: "", subject: "", message: "" });

    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Get in Touch</h2>
          <p>
            Have a question about a deal or a suggestion for a new feature? We'd
            love to hear from you.
          </p>
        </div>

        <div className={styles.contentWrapper}>
          {/* Left Side: Contact Info */}
          <div className={styles.contactInfo}>
            <div className={styles.infoCard}>
              <div className={styles.iconBox}>
                <FiMail />
              </div>
              <div>
                <h3>Email Us</h3>
                <p>ahmad.azad.mail@gmail.com</p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.iconBox}>
                <FiPhone />
              </div>
              <div>
                <h3>Call Us</h3>
                <p>+92 325 9422297</p>
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.iconBox}>
                <FiMapPin />
              </div>
              <div>
                <h3>Location</h3>
                <p>FAST, Lahore, Pakistan</p>
              </div>
            </div>
          </div>

          <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.contactForm}>
              <div className={styles.inputGroup}>
                <label>Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com "
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="How can we help?"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Type your message here..."
                ></textarea>
              </div>

              <button type="submit" className={styles.submitBtn}>
                <FiSend /> Send Message
              </button>

              {status === "success" && (
                <div className={styles.successMessage}>
                  Your message has been sent successfully!
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
