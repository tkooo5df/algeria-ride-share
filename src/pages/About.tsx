import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">About Us</h1>
        <p className="text-muted-foreground">
          This is the about page for DZ Taxi. We are a company dedicated to providing the best taxi service in Algeria.
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default About;