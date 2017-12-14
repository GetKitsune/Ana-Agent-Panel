import {
	Component,
	OnInit
} from "@angular/core";
import { LoginResponse, DataService } from "../../../shared/services/data/data.service"
//import { Http } from "@angular/Http"
import { ConfigService, UserProfile } from "../../../shared/services/config/config.service";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
@Component({
	selector: ".content_inner_wrapper",
	templateUrl: "./login.component.html",
	styleUrls: ["./login.component.scss"]
})

export class LoginComponent implements OnInit {

	public username: string;
	public password: string;

	constructor(public router: Router, private config: ConfigService, private data: DataService) {

	}

	signIn() {
		this.data.login(this.username, this.password).subscribe(resData => {
			if (resData.error)
				alert(resData.error.message);
			else {
				let userProfile = this.config.getUserProfileFromLoginDetails(resData.data);
				if (userProfile.accessToken) {
					this.config.profile = userProfile;
					localStorage.setItem("profile", JSON.stringify(this.config.profile));
					this.router.navigate(['/chat']);
				}
				else
					this.router.navigate(['/']);
			}
		})
	}

	ngOnInit() {
		let savedProfile = JSON.parse(localStorage.getItem("profile")) as UserProfile;
		if (savedProfile && savedProfile.accessToken) {
			this.data.isAccessTokenValid(savedProfile.accessToken).subscribe(resp => {
				if (resp.error)
					alert(resp.error.message);
				else {
					this.config.profile = this.config.getUserProfileFromLoginDetails(resp.data);
					this.router.navigate(['/chat']);
				}
			}, err => {
				if (err.status == 401) {
					this.data.logout();
					this.router.navigate(['/chat']);
				} else
					alert(`Unexpected error occured!\r\n${err.message}`);
			});
		}
	}
}
