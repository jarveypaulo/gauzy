import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProposalsComponent } from './proposals.component';
import { ProposalRegisterComponent } from './proposal-register/proposal-register.component';
import { ProposalDetailsComponent } from './proposal-details/proposal-details.component';
import { ProposalEditComponent } from './proposal-edit/proposal-edit.component';

const routes: Routes = [
	{
		path: '',
		component: ProposalsComponent
	},
	{
		path: 'register',
		component: ProposalRegisterComponent
	},
	{
		path: 'details/:id',
		component: ProposalDetailsComponent
	},
	{
		path: 'edit/:id',
		component: ProposalEditComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ProposalsRoutingModule {}
