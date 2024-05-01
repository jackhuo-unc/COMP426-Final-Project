import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { Movie } from '../models.module';

@Component({
  selector: 'movie-display',
  standalone: true,
  imports: [],
  templateUrl: './movie-display.widget.html',
  styleUrl: './movie-display.widget.css'
})
export class MovieDisplay implements OnInit{
  @Input() movie!: Movie;

  constructor() {}

  ngOnInit() {}
}
