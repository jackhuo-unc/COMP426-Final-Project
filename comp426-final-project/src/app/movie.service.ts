import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  constructor(protected http: HttpClient) {

   }

  getMovieById(id: number) {
    return this.http.get(`https://api.themoviedb.org/3/movie/${id}?api_key=3c86f49ada9b34f379ca5d429d95bd66`);
  }

  getMovieBySearchString(searchString: string) {
    return this.http.get('https://api.themoviedb.org/3/search/movie?api_key=3c86f49ada9b34f379ca5d429d95bd66&query=' + searchString);
  }
}
