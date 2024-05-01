import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MovieService } from '../movie.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {
  title = 'comp426-final-project';

  constructor(
    public movieService: MovieService
  ) {}

  ngOnInit() {
    this.movieService.getMovieById(121).subscribe((data) => {
      console.log(data);
    });
  }

}
