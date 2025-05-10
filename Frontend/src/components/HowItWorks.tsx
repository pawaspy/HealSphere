
import { Check } from "lucide-react";

const steps = [
  {
    title: "Fill Your Information",
    description: "Enter your basic details and select the specialty you need consultation for."
  },
  {
    title: "Make a Payment",
    description: "Securely pay for your consultation using various payment methods."
  },
  {
    title: "Join Video Call",
    description: "Connect with your healthcare provider through our secure video platform."
  },
  {
    title: "Get Care & Follow-Up",
    description: "Receive care, prescriptions, and follow-up instructions after your consultation."
  }
];

const HowItWorks = () => {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Getting the care you need is simple and straightforward with our telehealth platform.
          </p>
        </div>
        
        <div className="relative">
          {/* Step connector line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />
          
          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col md:flex-row items-center md:relative">
                <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:order-1 md:pl-16'}`}>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                
                <div className="my-4 md:my-0 md:absolute md:left-1/2 md:-translate-x-1/2 z-10">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
                    {index < 3 ? (
                      <span className="text-lg font-bold">{index + 1}</span>
                    ) : (
                      <Check className="h-6 w-6" />
                    )}
                  </div>
                </div>
                
                {index % 2 !== 0 && <div className="w-full md:w-1/2" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
