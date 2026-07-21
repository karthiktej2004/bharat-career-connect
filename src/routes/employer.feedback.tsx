import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { DashShell, PageHeader } from "@/components/DashShell";
import { employerNav } from "@/lib/dashNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, Video as VideoIcon, Square, RefreshCw, CheckCircle, Loader2 } from "lucide-react";
import { getSession } from "@/lib/mockStore";
import { toast } from "sonner";

export const Route = createFileRoute("/employer/feedback")({
  head: () => ({ meta: [{ title: "Share Feedback — Bharat Career Connect" }] }),
  component: EmployerFeedbackPage,
});

function EmployerFeedbackPage() {
  return (
    <DashShell role="employer" nav={employerNav}>
      <EmployerFeedbackBody />
    </DashShell>
  );
}

export function EmployerFeedbackBody() {
  const user = getSession();
  const employerId = user?.id;

  // Form State
  const [rating, setRating] = useState(0);
  const [candidateQuality, setCandidateQuality] = useState("");
  const [eventOrganization, setEventOrganization] = useState("");
  const [hiringEfficiency, setHiringEfficiency] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Camera & Recording State
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // FIX: This ensures the stream attaches ONLY AFTER the <video> element actually renders!
  useEffect(() => {
    if (cameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraActive, stream]);

  // ======================================================================
  // CAMERA LOGIC
  // ======================================================================
  const enableCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err) {
      toast.error("Camera access denied or unavailable.");
    }
  };

  const startRecording = () => {
    if (!stream) return;
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    const chunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      setCameraActive(false);
      // Stop tracks so the camera light turns off
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const retakeVideo = () => {
    setRecordedUrl(null);
    enableCamera();
  };

  // ======================================================================
  // SUBMIT FORM TO POSTGRESQL
  // ======================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employerId) return toast.error("Please log in to submit feedback.");
    if (rating === 0) return toast.error("Please provide an overall rating.");

    setIsSubmitting(true);
    try {
      // In a real app, upload the videoBlob to an S3 bucket here first.
      const mockUploadedVideoUrl = recordedUrl ? "https://storage.bharatcareerconnect.com/videos/emp_vid.mp4" : null;

      const res = await fetch("http://localhost:5000/api/employer/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employerId,
          rating,
          candidateQuality,
          eventOrganization,
          hiringEfficiency,
          videoUrl: mockUploadedVideoUrl
        })
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Feedback & Video submitted successfully!");
        setRating(0);
        setCandidateQuality("");
        setEventOrganization("");
        setHiringEfficiency("");
        setRecordedUrl(null);
      } else {
        toast.error("Failed to submit feedback.");
      }
    } catch (error) {
      toast.error("Server connection error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Share your feedback"
        description="Help us improve. Admin reviews and publishes feedback."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: Main Form */}
        <Card className="p-6 border-border/60">
          <h3 className="font-display font-bold text-navy text-xl mb-6">Share your experience</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Star Rating */}
            <div>
              <Label className="text-base text-navy font-bold flex items-center gap-1 mb-2">Overall rating</Label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating ? "fill-saffron text-saffron" : "text-muted stroke-[1.5]"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Candidate Quality */}
            <div>
              <Label className="text-navy font-bold mb-2 block">Candidate quality</Label>
              <Textarea
                rows={4}
                placeholder="How well did candidates match your roles?"
                value={candidateQuality}
                onChange={(e) => setCandidateQuality(e.target.value)}
                className="resize-none bg-background"
              />
            </div>

            {/* Event Organisation */}
            <div>
              <Label className="text-navy font-bold mb-2 block">Event management</Label>
              <Textarea
                rows={4}
                placeholder="Registration, stalls, schedules, on-ground help."
                value={eventOrganization}
                onChange={(e) => setEventOrganization(e.target.value)}
                className="resize-none bg-background"
              />
            </div>

            {/* Hiring Efficiency */}
            <div>
              <Label className="text-navy font-bold mb-2 block">Hiring efficiency</Label>
              <Textarea
                rows={4}
                placeholder="Interview slots, offer roll-out, joining follow-up."
                value={hiringEfficiency}
                onChange={(e) => setHiringEfficiency(e.target.value)}
                className="resize-none bg-background"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting || rating === 0} 
              className="w-full bg-saffron text-navy hover:bg-saffron/90 font-bold"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit Feedback
            </Button>
          </form>
        </Card>

        {/* RIGHT COLUMN: Video Testimonial Box */}
        <Card className="p-6 border-border/60 flex flex-col">
          <h3 className="font-display font-bold text-navy text-xl mb-6">Record a video testimonial</h3>
          
          <div className="flex-1 rounded-2xl bg-navy border-2 border-dashed border-border/50 relative overflow-hidden flex flex-col items-center justify-center p-8 min-h-[400px]">
            
            {/* STATE 1: IDLE / NOT STARTED */}
            {!cameraActive && !recordedUrl && (
              <div className="text-center text-white flex flex-col items-center max-w-sm">
                <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center mb-6">
                  <VideoIcon className="h-8 w-8 text-white/70" />
                </div>
                <h4 className="font-display font-bold text-2xl mb-3">Share your story</h4>
                <p className="text-white/60 text-sm mb-8">
                  Allow camera and microphone access to record a short 60-second video about your hiring journey.
                </p>
                <Button onClick={enableCamera} className="bg-saffron text-navy hover:bg-saffron/90 font-bold px-8 py-6 text-base rounded-full">
                  Enable Camera
                </Button>
              </div>
            )}

            {/* STATE 2: LIVE CAMERA & RECORDING */}
            {cameraActive && (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="absolute inset-0 w-full h-full object-cover -scale-x-100" 
                />
                {/* Overlay Controls */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
                  {!isRecording ? (
                    <Button onClick={startRecording} className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-6 shadow-xl">
                      <div className="h-4 w-4 rounded-full bg-white mr-2 animate-pulse" />
                      Start Recording
                    </Button>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="bg-black/50 text-white px-3 py-1 rounded-md text-xs mb-3 flex items-center font-bold tracking-widest backdrop-blur-md">
                        <div className="h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse" /> RECORDING
                      </span>
                      <Button onClick={stopRecording} variant="outline" className="border-red-500 bg-black/50 text-red-500 hover:bg-red-500 hover:text-white rounded-full px-6 py-6 backdrop-blur-md">
                        <Square className="h-4 w-4 mr-2 fill-current" />
                        Stop Recording
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* STATE 3: VIDEO RECORDED (PLAYBACK) */}
            {recordedUrl && (
              <>
                <video 
                  src={recordedUrl} 
                  controls 
                  className="absolute inset-0 w-full h-full object-cover bg-black"
                />
                {/* Overlay Controls */}
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-india-green text-white font-bold px-3 py-1 text-sm shadow-md">
                    <CheckCircle className="h-4 w-4 mr-1.5" /> Video Saved
                  </Badge>
                </div>
                <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
                  <Button onClick={retakeVideo} variant="outline" className="bg-black/60 border-white/20 text-white hover:bg-black/80 rounded-full backdrop-blur-md">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retake Video
                  </Button>
                </div>
              </>
            )}

          </div>
        </Card>
      </div>
    </>
  );
}