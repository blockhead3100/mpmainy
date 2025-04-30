
"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { convertYoutube, YoutubeFormat } from "@/services/youtube";
import { summarizeArticle } from "@/ai/flows/summarize-article";
import { transcribeYouTubeVideo } from "@/ai/flows/transcribe-youtube-video";
import { summarizeTranscription } from "@/ai/flows/summarize-transcription-flow"; // Added import
import { translateTranscription } from "@/ai/flows/translate-transcription-flow"; // Added import
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Link as LinkIcon, Languages, TextSelect, Wand2 } from "lucide-react"; // Added icons
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Added import
import { Label } from "@/components/ui/label"; // Added import

// List of common languages for translation dropdown
const languages = [
  "English", "Spanish", "French", "German", "Chinese (Simplified)", "Japanese",
  "Korean", "Russian", "Portuguese", "Italian", "Arabic", "Hindi", "Turkish", "Dutch"
];

export default function Home() {
  const [article, setArticle] = useState("");
  const [summary, setSummary] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [transcription, setTranscription] = useState("");
  const [transcriptionSummary, setTranscriptionSummary] = useState(""); // Added state
  const [translation, setTranslation] = useState(""); // Added state
  const [targetLanguage, setTargetLanguage] = useState(languages[0]); // Default to English
  const [conversionUrl, setConversionUrl] = useState("");
  const [convertedFormat, setConvertedFormat] = useState<YoutubeFormat | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isSummarizingTranscription, setIsSummarizingTranscription] = useState(false); // Added state
  const [isTranslating, setIsTranslating] = useState(false); // Added state
  const { toast } = useToast();

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummary("");
    try {
      const result = await summarizeArticle({ article });
      setSummary(result.summary);
      toast({
        title: "Article summarized!",
        description: "The summary has been generated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error summarizing article!",
        description: error.message,
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleTranscribe = async () => {
    if (!youtubeUrl) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a YouTube URL.",
      });
      return;
    }
    setIsTranscribing(true);
    setTranscription("");
    setTranscriptionSummary(""); // Clear summary on new transcription
    setTranslation(""); // Clear translation on new transcription
    setConversionUrl("");
    setConvertedFormat(null);
    try {
      const result = await transcribeYouTubeVideo({ youtubeUrl });
      setTranscription(result.transcription);
      toast({
        title: "YouTube video transcribed!",
        description: "The transcription has been generated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error transcribing YouTube video!",
        description: error.message,
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleConvert = async (format: YoutubeFormat) => {
     if (!youtubeUrl) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a YouTube URL.",
      });
      return;
    }
    setIsConverting(true);
    setConversionUrl("");
    setTranscription(""); // Clear transcription if converting
    setTranscriptionSummary("");
    setTranslation("");
    setConvertedFormat(null);
    try {
      const result = await convertYoutube(youtubeUrl, format);
      setConversionUrl(result.url);
      setConvertedFormat(format);
      toast({
        title: `YouTube video converted to ${format.toUpperCase()}!`,
        description: "The download link is ready.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: `Error converting YouTube video to ${format.toUpperCase()}!`,
        description: error.message,
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleSummarizeTranscription = async () => {
    if (!transcription) return;
    setIsSummarizingTranscription(true);
    setTranscriptionSummary("");
    try {
      const result = await summarizeTranscription({ transcription });
      setTranscriptionSummary(result.summary);
      toast({
        title: "Transcription summarized!",
        description: "The summary of the transcription is ready.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error summarizing transcription!",
        description: error.message,
      });
    } finally {
      setIsSummarizingTranscription(false);
    }
  };

  const handleTranslateTranscription = async () => {
    if (!transcription || !targetLanguage) return;
    setIsTranslating(true);
    setTranslation("");
    try {
      const result = await translateTranscription({ transcription, targetLanguage });
      setTranslation(result.translation);
      toast({
        title: `Transcription translated to ${targetLanguage}!`,
        description: "The translated text is ready.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error translating transcription!",
        description: error.message,
      });
    } finally {
      setIsTranslating(false);
    }
  };


  const handleCopyToClipboard = (text: string, type: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
      title: `${type} copied to clipboard!`,
      description: "You can now paste it anywhere.",
    });
  };

  const handleDownloadText = (text: string, filename: string) => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
     toast({
      title: "Download started!",
      description: `${filename} is being downloaded.`,
    });
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Article Summarizer & Media Converter</h1>

      <Tabs defaultValue="youtube" className="w-full max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="youtube">YouTube Tools</TabsTrigger>
          <TabsTrigger value="article">Article Summarizer</TabsTrigger>
        </TabsList>

        {/* YouTube Tab */}
        <TabsContent value="youtube" className="mt-4 space-y-4">
          <Card className="shadow-md rounded-lg">
            <CardHeader>
              <CardTitle>YouTube Tools</CardTitle>
              <CardDescription>Paste a YouTube video link below for conversion, transcription, summarization, and translation.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                aria-label="YouTube URL Input"
              />
              <div className="flex flex-wrap gap-2 justify-center">
                <Button onClick={() => handleConvert("mp3")} disabled={isConverting || isTranscribing || !youtubeUrl || isSummarizingTranscription || isTranslating} className="flex-grow sm:flex-grow-0">
                  {isConverting && convertedFormat === 'mp3' ? "Converting..." : (isConverting ? "Processing..." : <><Download className="mr-2 h-4 w-4" />Convert to MP3</>)}
                </Button>
                <Button onClick={() => handleConvert("mp4")} disabled={isConverting || isTranscribing || !youtubeUrl || isSummarizingTranscription || isTranslating} className="flex-grow sm:flex-grow-0">
                   {isConverting && convertedFormat === 'mp4' ? "Converting..." : (isConverting ? "Processing..." : <><Download className="mr-2 h-4 w-4" />Convert to MP4</>)}
                </Button>
                <Button onClick={handleTranscribe} disabled={isTranscribing || isConverting || !youtubeUrl || isSummarizingTranscription || isTranslating} className="flex-grow sm:flex-grow-0">
                  {isTranscribing ? "Transcribing..." : <><Wand2 className="mr-2 h-4 w-4" />Transcribe Video</>}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Display conversion result (MP3/MP4) */}
          {conversionUrl && convertedFormat && (
            <Card className="mt-4 shadow-md rounded-lg">
              <CardHeader>
                <CardTitle>Download Your File</CardTitle>
                 <CardDescription>Click the button to download the converted {convertedFormat.toUpperCase()} file.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                 <a
                    href={conversionUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-grow"
                  >
                   <Button className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download .{convertedFormat}
                   </Button>
                  </a>
                 <Button
                    variant="outline"
                    size="icon"
                    title={`Copy ${convertedFormat.toUpperCase()} Link`}
                    onClick={() => handleCopyToClipboard(conversionUrl, `${convertedFormat.toUpperCase()} Link`)}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
              </CardContent>
            </Card>
          )}

          {/* Display transcription result & Actions */}
          {transcription && (
            <Card className="mt-4 shadow-md rounded-lg">
              <CardHeader>
                <CardTitle>Transcription Result</CardTitle>
                <CardDescription>The transcribed text from the video. You can summarize or translate it below.</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-4">
                <div className="flex justify-end gap-2 mb-2">
                   <Button
                    variant="outline"
                    size="icon"
                    title="Copy Transcription"
                    onClick={() => handleCopyToClipboard(transcription, "Transcription")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                   <Button
                    variant="outline"
                    size="icon"
                    title="Download Transcription (.txt)"
                    onClick={() => handleDownloadText(transcription, "transcript.txt")}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea value={transcription} readOnly className="min-h-[150px] bg-muted/30 rounded-md p-3" aria-label="Transcription Output"/>

                {/* Summarize & Translate Actions */}
                 <div className="flex flex-wrap gap-4 items-end">
                    {/* Summarize Button */}
                    <div className="flex-grow sm:flex-grow-0">
                        <Button onClick={handleSummarizeTranscription} disabled={isSummarizingTranscription || isTranslating || isTranscribing || isConverting}>
                        {isSummarizingTranscription ? "Summarizing..." : <><TextSelect className="mr-2 h-4 w-4" />Summarize</>}
                        </Button>
                    </div>

                    {/* Translate Section */}
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end flex-grow">
                       <div className="grid w-full sm:w-auto gap-1.5">
                         <Label htmlFor="language-select">Translate to:</Label>
                         <Select value={targetLanguage} onValueChange={setTargetLanguage} disabled={isTranslating || isSummarizingTranscription || isTranscribing || isConverting}>
                           <SelectTrigger id="language-select" className="w-full sm:w-[180px]">
                             <SelectValue placeholder="Select language" />
                           </SelectTrigger>
                           <SelectContent>
                             {languages.map(lang => (
                               <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                       </div>
                       <Button onClick={handleTranslateTranscription} disabled={isTranslating || isSummarizingTranscription || !targetLanguage || isTranscribing || isConverting} className="w-full sm:w-auto">
                         {isTranslating ? "Translating..." : <><Languages className="mr-2 h-4 w-4" />Translate</>}
                       </Button>
                    </div>
                 </div>
              </CardContent>
            </Card>
          )}

           {/* Display Transcription Summary */}
          {transcriptionSummary && (
            <Card className="mt-4 shadow-md rounded-lg">
              <CardHeader>
                <CardTitle>Transcription Summary</CardTitle>
                 <CardDescription>A concise summary of the video transcription.</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-2">
                  <div className="flex justify-end gap-2 mb-2">
                      <Button
                        variant="outline"
                        size="icon"
                        title="Copy Summary"
                        onClick={() => handleCopyToClipboard(transcriptionSummary, "Transcription Summary")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        title="Download Summary (.txt)"
                        onClick={() => handleDownloadText(transcriptionSummary, "transcript_summary.txt")}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                  </div>
                  <Textarea value={transcriptionSummary} readOnly className="min-h-[100px] bg-muted/30 rounded-md p-3" aria-label="Transcription Summary Output"/>
              </CardContent>
            </Card>
          )}

           {/* Display Translation Result */}
          {translation && (
            <Card className="mt-4 shadow-md rounded-lg">
              <CardHeader>
                <CardTitle>Translation Result ({targetLanguage})</CardTitle>
                 <CardDescription>The transcription translated into {targetLanguage}.</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-2">
                  <div className="flex justify-end gap-2 mb-2">
                      <Button
                        variant="outline"
                        size="icon"
                        title={`Copy Translation (${targetLanguage})`}
                        onClick={() => handleCopyToClipboard(translation, `Translation (${targetLanguage})`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        title={`Download Translation (${targetLanguage}) (.txt)`}
                        onClick={() => handleDownloadText(translation, `translation_${targetLanguage.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                  </div>
                  <Textarea value={translation} readOnly className="min-h-[150px] bg-muted/30 rounded-md p-3" aria-label="Translation Output"/>
              </CardContent>
            </Card>
          )}


        </TabsContent>

        {/* Article Summarizer Tab */}
        <TabsContent value="article" className="mt-4 space-y-4">
          <Card className="shadow-md rounded-lg">
            <CardHeader>
              <CardTitle>Article Summarization</CardTitle>
              <CardDescription>Paste the article text below to generate a summary.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Textarea
                value={article}
                onChange={(e) => setArticle(e.target.value)}
                placeholder="Paste your full article text here..."
                className="min-h-[150px] rounded-md"
                aria-label="Article Input"
              />
              <Button onClick={handleSummarize} disabled={isSummarizing || !article}>
                {isSummarizing ? "Summarizing..." : <><Wand2 className="mr-2 h-4 w-4" />Summarize Article</>}
              </Button>
            </CardContent>
          </Card>

          {summary && (
            <Card className="mt-4 shadow-md rounded-lg">
              <CardHeader>
                <CardTitle>Summary Result</CardTitle>
                <CardDescription>The generated summary of your article.</CardDescription>
              </CardHeader>
              <CardContent className="relative space-y-2">
                 <div className="flex justify-end gap-2 mb-2">
                   <Button
                     variant="outline"
                     size="icon"
                     title="Copy Summary"
                     onClick={() => handleCopyToClipboard(summary, "Summary")}
                   >
                     <Copy className="h-4 w-4" />
                   </Button>
                    <Button
                     variant="outline"
                     size="icon"
                      title="Download Summary (.txt)"
                     onClick={() => handleDownloadText(summary, "summary.txt")}
                   >
                     <Download className="h-4 w-4" />
                   </Button>
                 </div>
                <Textarea value={summary} readOnly className="min-h-[150px] bg-muted/30 rounded-md p-3" aria-label="Summary Output"/>
              </CardContent>
            </Card>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}
