import ContactForm from '../components/contact/ContactForm';

const Contact = () => {
  return (
    <div className="bg-secondary-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">Get In Touch</h2>
          <p className="mt-2 text-lg leading-8 text-secondary-600">
            Have a project in mind or just want to say hi? I'd love to hear from you.
          </p>
        </div>
        <div className="mt-16 max-w-2xl mx-auto">
          <ContactForm />
        </div>
      </div>
    </div>
  );
};

export default Contact;