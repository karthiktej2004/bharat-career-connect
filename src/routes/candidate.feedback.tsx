import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { candidateNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Video, Loader2, StopCircle, CheckCircle2, Camera, Building2 } from "lucide-react";
import { getSession } from "@/lib/mockStore";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/candidate/feedback")({
  head: () => ({ meta: [{ title: "My Feedback — Candidate" }] }),
  component: FeedbackPage,
});

// Static list of popular companies or fetched mock list
const COMPANIES = ["accenture", "axiomate", "Infosys", "TCS", "Wipro", "Cognizant", "Other / General Platform"];

export default function FeedbackPage() {
  // Overall Rating
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  
  // Specific Category Ratings (5-star for all)
  const [registrationRating, setRegistrationRating] = useState(0);
  const [interviewRating, setInterviewRating] = useState(0);
  const [eventRating, setEventRating] = useState(0);

  // Company Selection & Optional Dropdown Message Category
  const [selectedCompany, setSelectedCompany] = useState("");
  const [messageCategory, setMessageCategory] = useState("general");
  const [optionalComments, setOptionalComments] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- REAL VIDEO RECORDING STATE ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Attach the camera stream to the video element whenever it turns on
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // 1. Ask for Permissions and Turn on Camera
  const handleEnableCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Camera/Microphone permission denied. Please allow access in your browser.");
    }
  };

  // 2. Start Recording the Stream
  const handleStartRecording = () => {
    if (!stream) return;
    
    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      
      // Turn off the camera indicator light when done
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    };
    
    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  // 3. Stop Recording
  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
      toast.success("Video testimonial saved successfully!");
    }
  };

  // 4. Retake Video
  const handleRetake = () => {
    setVideoUrl(null);
    handleEnableCamera(); 
  };

  // --- SUBMIT TO BACKEND ---
  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please provide an overall rating.");
      return;
    }
    if (!selectedCompany) {
      toast.error("Please select a company for your feedback.");
      return;
    }

    setIsSubmitting(true);
    const session = getSession();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://15.207.249.155:5000"}/api/candidate/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: session?.id,
          rating,
          companyName: selectedCompany,
          registrationExp: `Rating: ${registrationRating}/5`,
          interviewQuality: `Rating: ${interviewRating}/5`,
          eventManagement: `Rating: ${eventRating}/5`,
          messageCategory,
          optionalComments,
          videoUrl: videoUrl ? "user_recorded_video_blob" : null 
        })
      });

      const json = await res.json();
      if (json.success) {
        toast.success(json.message || "Feedback submitted successfully!");
        setRating(0);
        setRegistrationRating(0);
        setInterviewRating(0);
        setEventRating(0);
        setSelectedCompany("");
        setMessageCategory("general");
        setOptionalComments("");
        setVideoUrl(null);
      } else {
        toast.error("Failed to submit feedback.");
      }
    } catch (err) {
      toast.error("Server connection failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup camera if user leaves the page while it's on
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [stream]);

  return (
    <DashShell role="candidate" nav={candidateNav}>
      <PageHeader 
        title="Your Feedback" 
        description="Help us improve. Rate your experience and target specific companies." 
      />

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        
        {/* LEFT CARD: DETAILED STRUCTURED FEEDBACK */}
        <Card className="p-6 border-border/60 bg-white shadow-sm space-y-6">
          <h3 className="font-display font-bold text-navy text-lg">Share your experience</h3>
          
          {/* 1. SELECT COMPANY */}
          <div>
            <Label className="text-navy font-bold flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-saffron" /> Select Company
            </Label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="mt-2 bg-slate-50"><SelectValue placeholder="Select company you interviewed with..." /></SelectTrigger>
              <SelectContent>
                {COMPANIES.map(comp => (
                  <SelectItem key={comp} value={comp}>{comp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. OVERALL RATING */}
          <div>
            <Label className="text-base text-navy font-bold">Overall Rating</Label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`h-7 w-7 cursor-pointer transition-colors ${
                    (hoverRating || rating) >= star ? "fill-saffron text-saffron" : "text-slate-300"
                  }`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            {/* Registration Experience 5-Star */}
            <div>
              <Label className="text-xs font-semibold text-slate-700">Registration</Label>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-5 w-5 cursor-pointer transition-colors ${
                      registrationRating >= star ? "fill-saffron text-saffron" : "text-slate-300"
                    }`}
                    onClick={() => setRegistrationRating(star)}
                  />
                ))}
              </div>
            </div>

            {/* Interview Quality 5-Star */}
            <div>
              <Label className="text-xs font-semibold text-slate-700">Interview Quality</Label>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-5 w-5 cursor-pointer transition-colors ${
                      interviewRating >= star ? "fill-saffron text-saffron" : "text-slate-300"
                    }`}
                    onClick={() => setInterviewRating(star)}
                  />
                ))}
              </div>
            </div>

            {/* Event Management 5-Star */}
            <div>
              <Label className="text-xs font-semibold text-slate-700">Event Management</Label>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-5 w-5 cursor-pointer transition-colors ${
                      eventRating >= star ? "fill-saffron text-saffron" : "text-slate-300"
                    }`}
                    onClick={() => setEventRating(star)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 3. OPTIONAL MESSAGE CATEGORY DROPDOWN */}
          <div className="pt-2 border-t border-slate-100">
            <Label className="text-navy font-medium">Feedback Category (Optional)</Label>
            <Select value={messageCategory} onValueChange={setMessageCategory}>
              <SelectTrigger className="mt-2 bg-slate-50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Feedback</SelectItem>
                <SelectItem value="praise">Praise / Commendation</SelectItem>
                <SelectItem value="suggestion">Improvement Suggestion</SelectItem>
                <SelectItem value="complaint">Report an Issue / Complaint</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 4. OPTIONAL COMMENTS TEXTAREA */}
          <div>
            <Label className="text-navy font-medium">Additional Comments (Optional)</Label>
            <Textarea 
              value={optionalComments}
              onChange={(e) => setOptionalComments(e.target.value)}
              placeholder="Provide specific notes or context for this company..."
              className="mt-2 bg-slate-50 min-h-[90px]" 
            />
          </div>

          <Button 
            className="w-full bg-saffron text-navy hover:bg-saffron/90 font-bold py-6 text-base"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : null}
            {isSubmitting ? "Submitting..." : "Submit for review"}
          </Button>
        </Card>

        {/* RIGHT CARD: REAL VIDEO TESTIMONIAL */}
        <Card className="p-6 border-border/60 bg-white shadow-sm flex flex-col h-full">
          <h3 className="font-display font-bold text-navy text-lg mb-6">Record a video testimonial</h3>
          
          <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl bg-slate-900 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[350px]">
            
            {/* STATE 1: SAVED VIDEO PLAYBACK */}
            {videoUrl ? (
              <div className="absolute inset-0 w-full h-full bg-black flex flex-col">
                <video src={videoUrl} controls className="w-full h-full object-contain bg-black" />
                <div className="absolute top-4 right-4">
                  <Button variant="secondary" size="sm" onClick={handleRetake} className="font-bold shadow-md">
                    <Camera className="h-4 w-4 mr-2" /> Retake
                  </Button>
                </div>
              </div>
            ) : 
            
            /* STATE 2: LIVE CAMERA STREAM */
            stream ? (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 flex flex-col justify-between p-6">
                  <div className="flex justify-end">
                    {isRecording && (
                      <div className="flex items-center gap-2 bg-black/50 text-white px-3 py-1.5 rounded-full backdrop-blur-md">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" /> 
                        <span className="text-sm font-bold tracking-wider">REC</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-center">
                    {isRecording ? (
                      <Button variant="destructive" size="lg" onClick={handleStopRecording} className="font-bold shadow-xl rounded-full px-8">
                        <StopCircle className="h-5 w-5 mr-2" /> Stop Recording
                      </Button>
                    ) : (
                      <Button size="lg" onClick={handleStartRecording} className="bg-red-500 hover:bg-red-600 text-white font-bold shadow-xl rounded-full px-8">
                        <Video className="h-5 w-5 mr-2" /> Start Recording
                      </Button>
                    )}
                  </div>
                </div>
              </>
            ) : 
            
            /* STATE 3: DEFAULT (CAMERA OFF) */
            (
              <div className="flex flex-col items-center p-8 animate-in fade-in duration-300">
                <div className="size-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                  <Video className="h-8 w-8 text-slate-400" />
                </div>
                <h4 className="font-display font-bold text-white text-lg">Share your story</h4>
                <p className="text-slate-400 mt-2 max-w-xs mb-6 text-sm">
                  Allow camera and microphone access to record a short 60-second video regarding your experience with the selected company.
                </p>
                <Button className="bg-saffron text-navy hover:bg-saffron/90 font-bold px-6" onClick={handleEnableCamera}>
                  Enable Camera
                </Button>
              </div>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mt-6 text-center">
            All testimonials are reviewed by admin before being published on the platform.
          </p>
        </Card>

      </div>
    </DashShell>
  );
}
