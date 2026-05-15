'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function ShareButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [shareLink, setShareLink] = useState<string | null>(null)

  const handleShare = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/share', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to generate link')
      
      const data = await res.json()
      const url = `${window.location.origin}/shared/${data.token}`
      setShareLink(url)
    } catch (error) {
      toast.error('Failed to generate share link')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink)
      toast.success('Link copied to clipboard!')
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={handleShare}>
          Share Goals
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view your approved goals and progress.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Input
              id="link"
              defaultValue={shareLink || 'Generating...'}
              readOnly
            />
          </div>
          <Button type="button" size="sm" className="px-3" onClick={copyToClipboard} disabled={!shareLink}>
            <span className="sr-only">Copy</span>
            Copy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
