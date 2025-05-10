
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react"; // BrainCircuit removed
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface LLMModel {
  id: string;
  name: string;
  isPro?: boolean;
  dotColorClass?: string;
}

// Updated list of available models including OpenRouter options
const availableModels: LLMModel[] = [
  { id: "openrouter/o4-mini-high", name: "o4-mini-high", isPro: false, dotColorClass: "bg-muted-foreground" },
  { id: "openrouter/claude-3.7-thinking", name: "Claude 3.7 Thinking", isPro: false, dotColorClass: "bg-muted-foreground" },
  { id: "openrouter/gpt-4.5-turbo", name: "GPT 4.5", isPro: true, dotColorClass: "bg-muted-foreground" },
  { id: "openrouter/gemini-2.5-pro", name: "Gemini 2.5 Pro", isPro: true, dotColorClass: "bg-muted-foreground" },
  { id: "openrouter/grok-3", name: "Grok 3", isPro: true, dotColorClass: "bg-muted-foreground" },
  { id: "openrouter/claude-3.7", name: "Claude 3.7", isPro: false, dotColorClass: "bg-muted-foreground" },
  { id: "openrouter/gpt-4.1-preview", name: "GPT 4.1", isPro: false, dotColorClass: "bg-muted-foreground" },
  { id: "openrouter/grok-3-mini", name: "Grok 3 Mini", isPro: false, dotColorClass: "bg-yellow-400" },
  { id: "googleai/gemini-1.5-pro-latest", name: "Gemini 1.5 Pro", isPro: true, dotColorClass: "bg-primary" },
  { id: "googleai/gemini-1.5-flash-latest", name: "Gemini 1.5 Flash", isPro: false, dotColorClass: "bg-green-500" },
  { id: "googleai/gemini-2.0-flash", name: "Gemini 2.0 Flash", isPro: false, dotColorClass: "bg-muted-foreground" },
];

export const defaultModelId = "googleai/gemini-2.0-flash"; // Default model remains unchanged

interface ModelSelectorProps {
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
}

export function ModelSelector({ selectedModelId, onModelChange }: ModelSelectorProps) {
  const t = useTranslations("ModelSelector");
  const commonT = useTranslations("Common");
  
  const [currentSelectedModel, setCurrentSelectedModel] = useState<LLMModel | undefined>(
    availableModels.find(m => m.id === selectedModelId) || availableModels.find(m => m.id === defaultModelId)
  );

  useEffect(() => {
    const model = availableModels.find(m => m.id === selectedModelId);
    if (model) {
      setCurrentSelectedModel(model);
    } else {
      // If selectedModelId is not in the list (e.g. old value from localStorage), fallback to default
      const defaultModel = availableModels.find(m => m.id === defaultModelId);
      setCurrentSelectedModel(defaultModel);
      if (selectedModelId !== defaultModelId && defaultModel) { // Notify parent if current selection is invalid
          onModelChange(defaultModel.id);
      }
    }
  }, [selectedModelId, onModelChange]);

  if (!currentSelectedModel) {
    // Should not happen if defaultModelId is always in availableModels
    return null; 
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center text-xs text-muted-foreground p-1 h-auto hover:bg-muted focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-label={commonT('modelLabel', { modelName: currentSelectedModel.name })}
        >
          <span className={cn("w-2 h-2 rounded-full mr-1.5 flex-shrink-0", currentSelectedModel.dotColorClass)} />
          {commonT('modelLabelShort', { modelName: currentSelectedModel.name })}
          <ChevronDown size={14} className="ml-1 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>{t('selectModel')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={selectedModelId} onValueChange={onModelChange}>
          {availableModels.map((model) => (
            <DropdownMenuRadioItem key={model.id} value={model.id} className="cursor-pointer">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <span className={cn("w-2.5 h-2.5 rounded-full mr-2.5 flex-shrink-0", model.dotColorClass)} />
                  <span className="text-sm">{model.name}</span>
                </div>
                {model.isPro && (
                  <Badge 
                    variant="outline" 
                    className="ml-2 text-xs px-1.5 py-0.5 bg-primary/10 text-primary border-primary/30 font-medium"
                  >
                    PRO
                  </Badge>
                )}
              </div>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

