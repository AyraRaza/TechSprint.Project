import { Star } from "lucide-react";

const feedbacks = [
  {
    name: "Ayaan Khan",
    role: "Frontend Developer",
    feedback:
      "This platform completely changed how I prepare for interviews. The AI feedback feels insanely accurate.",
  },
  {
    name: "Akshad Gujarkar",
    role: "Data Analyst",
    feedback:
      "Practicing with real-time feedback boosted my confidence a lot. I cracked my interview on the first try.",
  },
  {
    name: "Afreen Sheikh",
    role: "Backend Engineer",
    feedback:
      "The structured feedback and mock interviews feel very close to real interviews. Highly recommended.",
  },
];

const FeedbackCarousel = () => {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
          Loved by <span className="gradient-text">Job Seekers</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          See how candidates are improving their interview performance with
          InterviewAI.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feedbacks.map((item, index) => (
          <div
            key={index}
            className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-primary fill-primary" />
              ))}
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              “{item.feedback}”
            </p>

            <div>
              <div className="font-semibold">{item.name}</div>
              <div className="text-xs text-muted-foreground">{item.role}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeedbackCarousel;
