import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nyan-cat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nyan-cat.html',
  styleUrl: './nyan-cat.css',
})
export class NyanCat implements AfterViewInit {
  isFriendly: boolean = true;

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  ngOnInit() {
    this.isFriendly = Math.random() > 0.5;
  }
  ngAfterViewInit() {
    if (this.videoPlayer) {
      this.videoPlayer.nativeElement.muted = false;
      this.videoPlayer.nativeElement.volume = 0.5;

      const playPromise = this.videoPlayer.nativeElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.log('Autoplay prevented by browser, showing unmute button');
          this.videoPlayer.nativeElement.muted = true;
          this.videoPlayer.nativeElement.play();
        });
      }
    }
  }
}
