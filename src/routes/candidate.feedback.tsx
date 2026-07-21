import { createFileRoute } from "@tanstack/react-router";
import { DashShell, PageHeader } from "@/components/DashShell";
import { candidateNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Video, Loader2, StopCircle, CheckCircle2, Camera } from "lucide-react";
import { getSession } from "@/lib/mockStore";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/candidate/feedback")({
  head: () => ({ meta: [{ title: "My Feedback — Candidate" }] }),
  component: FeedbackPage,
});

function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  
  const [registrationExp, setRegistrationExp] = useState("");
  const [interviewQuality, setInterviewQuality] = useState("");
  const [eventManagement, setEventManagement] = useState("");
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
    handleEnableCamera(); // Immediately turn the camera back on
  };

  // --- SUBMIT TO BACKEND ---
  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please provide an overall rating.");
      return;
    }

    setIsSubmitting(true);
    const session = getSession();

    try {
      const res = await fetch("https://bcc-backend-0cny.onrender.com/api/candidate/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: session?.id,
          rating,
          registrationExp,
          interviewQuality,
          eventManagement,
          // Sending a string representation of the video file for the backend
          videoUrl: videoUrl ? "user_recorded_video_blob" : null 
        })
      });

      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setRating(0);
        setRegistrationExp("");
        setInterviewQuality("");
        setEventManagement("");
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
        description="Help us improve. Admin reviews and publishes feedback." 
      />

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        
        {/* LEFT CARD: TEXT FEEDBACK */}
        <Card className="p-6 border-border/60 bg-white shadow-sm">
          <h3 className="font-display font-bold text-navy text-lg mb-6">Share your experience</h3>
          
          <div className="space-y-6">
            <div>
              <Label className="text-base text-navy font-bold">Overall rating</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-8 w-8 cursor-pointer transition-colors ${
                      (hoverRating || rating) >= star ? "fill-saffron text-saffron" : "text-slate-300"
                    }`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label className="text-navy font-medium">Registration experience</Label>
              <Textarea 
                value={registrationExp}
                onChange={(e) => setRegistrationExp(e.target.value)}
                className="mt-2 bg-slate-50 min-h-[100px]" 
              />
            </div>
            
            <div>
              <Label className="text-navy font-medium">Interview quality</Label>
              <Textarea 
                value={interviewQuality}
                onChange={(e) => setInterviewQuality(e.target.value)}
                className="mt-2 bg-slate-50 min-h-[100px]" 
              />
            </div>
            
            <div>
              <Label className="text-navy font-medium">Event management</Label>
              <Textarea 
                value={eventManagement}
                onChange={(e) => setEventManagement(e.target.value)}
                className="mt-2 bg-slate-50 min-h-[100px]" 
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
          </div>
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
                  muted // Muted so you don't hear your own echo!
                  playsInline 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Recording UI Overlay */}
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
                      <Button variant="destructive" size="lg" onClick={handleStopRecording} className="font-bold shadow-xl rounded-full px-8 animate-in slide-in-from-bottom-4">
                        <StopCircle className="h-5 w-5 mr-2" /> Stop Recording
                      </Button>
                    ) : (
                      <Button size="lg" onClick={handleStartRecording} className="bg-red-500 hover:bg-red-600 text-white font-bold shadow-xl rounded-full px-8 animate-in slide-in-from-bottom-4">
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
                  Allow camera and microphone access to record a short 60-second video about your hiring journey.
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
