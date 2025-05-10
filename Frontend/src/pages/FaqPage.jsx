import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Minus } from "lucide-react";

const faqCategories = [
  { category: "general", label: "General Questions" },
  { category: "consultation", label: "About Consultations" },
  { category: "payment", label: "Payment & Insurance" },
  { category: "technical", label: "Technical Support" }
];

const faqData = [
  {
    category: "general",
    question: "What is TeleHealth?",
    answer: "TeleHealth is a telehealth platform that connects patients with licensed healthcare providers through secure video consultations. Our service allows you to receive medical advice, diagnoses, and treatment plans from the comfort of your home."
  },
  {
    category: "general",
    question: "Is telehealth right for me?",
    answer: "Telehealth is ideal for non-emergency medical issues, follow-up appointments, mental health consultations, and managing chronic conditions. However, it's not suitable for medical emergencies, situations requiring physical examination, or complex procedures."
  },
  {
    category: "consultation",
    question: "How do I schedule a consultation?",
    answer: "To schedule a consultation, click on the 'Start Consultation' button, fill out the required information about your health concern, select your preferred specialist, and choose an available time slot. You'll receive a confirmation email with details to join the video call."
  },
  {
    category: "consultation",
    question: "How long do consultations typically last?",
    answer: "Most consultations last between 15-30 minutes, depending on the complexity of your health concern. If additional time is needed, your healthcare provider will let you know during the session."
  },
  {
    category: "payment",
    question: "How much does a consultation cost?",
    answer: "Consultation fees vary by specialty. General consultations start at ₹499, while specialist consultations range from ₹799 to ₹1499. You can see the exact fee before confirming your appointment."
  },
  {
    category: "payment",
    question: "Does insurance cover telehealth consultations?",
    answer: "Many insurance plans now cover telehealth consultations. We accept most major insurance providers. You can verify coverage by entering your insurance information during the booking process or contacting your insurance provider directly."
  },
  {
    category: "technical",
    question: "What equipment do I need for a video consultation?",
    answer: "You'll need a device with a camera and microphone (smartphone, tablet, or computer), a stable internet connection, and a quiet, private space. We recommend testing your equipment before your scheduled appointment."
  },
  {
    category: "technical",
    question: "What if I have technical issues during my consultation?",
    answer: "If you experience technical difficulties, try refreshing your browser or restarting the app. Our support team is available via live chat or by phone at +91 (800) 555-1234 to assist you with any technical issues."
  }
];

const FaqPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("general");
  const [expandedQuestions, setExpandedQuestions] = useState([]);
  
  const filteredFaqs = faqData.filter(faq => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };
  
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mb-8">
          Find answers to common questions about our telehealth services.
        </p>
        
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search for a question..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            variant={activeCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("all")}
          >
            All Questions
          </Button>
          {faqCategories.map((category) => (
            <Button 
              key={category.category}
              variant={activeCategory === category.category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category.category)}
            >
              {category.label}
            </Button>
          ))}
        </div>
        
        {filteredFaqs.length > 0 ? (
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-0">
                  <button
                    className="w-full text-left p-4 flex justify-between items-center"
                    onClick={() => toggleQuestion(index)}
                  >
                    <span className="font-medium">{faq.question}</span>
                    {expandedQuestions.includes(index) ? (
                      <Minus className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <Plus className="h-4 w-4 flex-shrink-0" />
                    )}
                  </button>
                  
                  {expandedQuestions.includes(index) && (
                    <div className="px-4 pb-4 pt-0 text-muted-foreground">
                      {faq.answer}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-lg font-medium">No matching questions found</p>
              <p className="text-muted-foreground">Try adjusting your search query or category filter</p>
            </CardContent>
          </Card>
        )}
        
        <div className="mt-12 bg-muted p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Still have questions?</h2>
          <p className="mb-4">
            If you couldn't find the answer you were looking for, please contact our support team.
          </p>
          <Button onClick={() => window.location.href = "mailto:support@telehealth.in"}>
            Contact Support
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default FaqPage;
