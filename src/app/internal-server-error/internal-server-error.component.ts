import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-internal-server-error',
  templateUrl: './internal-server-error.component.html',
  styleUrls: ['./internal-server-error.component.css'],
})
export class InternalServerErrorComponent implements OnInit {
  public errorMessage: string =
    'Server Probably is Down, Please Contact Administrator!';
  constructor() {}

  ngOnInit(): void {}
}
