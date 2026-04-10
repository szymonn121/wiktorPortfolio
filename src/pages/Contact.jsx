import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './Contact.module.css';

function Contact({ texts }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('Please complete all fields.');
      return;
    }
    if (!form.email.includes('@')) {
      setError('Please enter a valid email.');
      return;
    }
    setSent(true);
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <motion.main className={styles.contact} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.7 }}>
      <div className={styles.header}>
        <p className={styles.sectionLabel}>04. {texts.contact.heading}</p>
        <h2>{texts.contact.heading}</h2>
        <p>{texts.contact.description}</p>
      </div>
      <div className={styles.grid}>
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <label>
            {texts.contact.form.name}
            <input name="name" value={form.name} onChange={handleChange} placeholder={texts.contact.form.name} />
          </label>
          <label>
            {texts.contact.form.email}
            <input name="email" value={form.email} onChange={handleChange} placeholder={texts.contact.form.email} />
          </label>
          <label>
            {texts.contact.form.message}
            <textarea name="message" value={form.message} onChange={handleChange} placeholder={texts.contact.form.message} rows="5" />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          {sent && <p className={styles.sent}>{texts.contact.notification}</p>}
          <button type="submit" className={styles.submitButton}>{texts.contact.form.submit}</button>
        </form>
      </div>
    </motion.main>
  );
}

export default Contact;
