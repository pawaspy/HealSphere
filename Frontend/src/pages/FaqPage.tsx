
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const faqCategories = [
  {
    category: "General",
    questions: [
      {
        question: "What is telehealth?",
        answer: "Telehealth is the use of digital information and communication technologies to access healthcare services remotely. It allows you to consult with healthcare professionals from the comfort of your home using video calls, messaging, and other digital tools."
      },
      {
        question: "Is telehealth as effective as in-person visits?",
        answer: "Telehealth is effective for many types of consultations, especially follow-ups, minor illnesses, mental health services, and chronic condition management. However, some conditions may still require physical examination or testing that can only be done in person. Our healthcare providers will let you know if an in-person visit is necessary."
      },
      {
        question: "How does a telehealth consultation work?",
        answer: "You'll fill out a brief medical questionnaire, select the type of consultation you need, and make a payment. Then you'll enter our secure virtual consultation room where you can speak with a healthcare professional via video call. During the consultation, you can discuss your concerns, receive advice, and get prescriptions if needed."
      }
    ]
  },
  {
    category: "Technical",
    questions: [
      {
        question: "What equipment do I need for a telehealth consultation?",
        answer: "You'll need a device with a camera and microphone (smartphone, tablet, or computer) and a stable internet connection. Our platform works on most modern browsers without requiring any software installation."
      },
      {
        question: "What if I have technical difficulties during my consultation?",
        answer: "If you experience technical issues during your consultation, you can use the chat feature as a backup. If video connection is lost, your healthcare provider may call you on the phone number you provided. Our technical support team is also available to help resolve any issues."
      },
      {
        question: "Is my privacy protected during telehealth consultations?",
        answer: "Yes, we take your privacy very seriously. Our platform is HIPAA-compliant and uses end-to-end encryption for all video consultations and messaging. Your health information is securely stored and only accessible to authorized healthcare providers involved in your care."
      }
    ]
  },
  {
    category: "Billing & Insurance",
    questions: [
      {
        question: "How much does a telehealth consultation cost?",
        answer: "Our telehealth consultations start at $49 for a standard 15-minute consultation. Specialized services may have different pricing. All prices are shown before you make a payment."
      },
      {
        question: "Is telehealth covered by insurance?",
        answer: "Many insurance companies now cover telehealth consultations. We recommend checking with your insurance provider before your consultation to confirm coverage. We can provide you with documentation to submit to your insurance for potential reimbursement."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, debit cards, and PayPal. Payment is securely processed through our encrypted payment system."
      }
    ]
  },
  {
    category: "Medical",
    questions: [
      {
        question: "Can doctors prescribe medication through telehealth?",
        answer: "Yes, doctors can prescribe many medications through telehealth consultations. However, there are certain medications (like controlled substances) that may require an in-person visit depending on state regulations."
      },
      {
        question: "What medical conditions can be treated via telehealth?",
        answer: "Many conditions can be addressed through telehealth, including cold and flu symptoms, allergies, rashes, minor infections, chronic condition management, mental health concerns, and general health questions. If your condition requires an in-person examination, our doctors will advise you accordingly."
      },
      {
        question: "What happens if I need lab work or tests?",
        answer: "If you need laboratory tests, our healthcare providers can send you a lab order that you can take to a local laboratory. The results will be sent directly to our healthcare providers who will then review them and discuss the results with you in a follow-up consultation."
      }
    ]
  }
];

const FaqPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  
  const filteredFaqs = faqCategories.flatMap(category => {
    return category.questions.filter(faq => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    ).map(faq => ({
      ...faq,
      category: category.category
    }));
  });
  
  const displayFaqs = activeCategory === "all" 
    ? filteredFaqs 
    : filteredFaqs.filter(faq => faq.category === activeCategory);
  
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="hero-gradient py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold mb-6">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-600 mb-8">
              Find answers to common questions about our telehealth services.
            </p>
            <div className="relative max-w-md mx-auto">
              <Input 
                type="search" 
                placeholder="Search questions..." 
                className="pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </section>
        
        {/* FAQ Categories */}
        <section className="py-8 px-4 border-b">
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-wrap justify-center gap-2">
              <Button 
                variant={activeCategory === "all" ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setActiveCategory("all")}
              >
                All Categories
              </Button>
              {faqCategories.map((category, index) => (
                <Button 
                  key={index}
                  variant={activeCategory === category.category ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => setActiveCategory(category.category)}
                >
                  {category.category}
                </Button>
              ))}
            </div>
          </div>
        </section>
        
        {/* FAQ Listing */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            {displayFaqs.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No questions match your search</h3>
                <p className="text-gray-600 mb-6">Try different keywords or browse all categories</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setActiveCategory("all");
                  }}
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {displayFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left">
                      <div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-primary mr-2">{faq.category}</span>
                        </div>
                        {faq.question}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </section>
        
        {/* Still Have Questions */}
        <section className="py-16 px-4 bg-primary text-white">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-xl mb-8 opacity-90">
              Our team is here to help you with any questions you may have about our telehealth services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-white"
                onClick={() => navigate("/start-consultation")}
              >
                Start Consultation <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-white hover:bg-white hover:text-primary"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default FaqPage;
