import { Connection } from 'typeorm';
import { Tenant } from '../tenant/tenant.entity';
import { Organization } from '../organization/organization.entity';
import { Employee } from '../employee/employee.entity';
import { AvailabilitySlots } from './availability-slots.entity';
import * as faker from 'faker';
import * as moment from 'moment';

export const createDefaultAvailabilitySlots = async (
  connection: Connection,
  Organizations,
  Employees,
  noOfAvailabilitySlotsPerOrganization: number
): Promise<AvailabilitySlots[]> => {
  let slots: AvailabilitySlots[] = [];
    // for (const org of Organizations) {
      slots = await dataOperation(connection, slots, noOfAvailabilitySlotsPerOrganization, Employees, Organizations);
    // }
  return slots;
};

export const createRandomAvailabilitySlots = async (
	connection: Connection,
	tenants: Tenant[],
	tenantOrganizationsMap: Map<Tenant, Organization[]>,
	tenantEmployeeMap: Map<Tenant, Employee[]>,
	noOfAvailabilitySlotsPerOrganization: number
): Promise<AvailabilitySlots[]> => {
	let slots: AvailabilitySlots[] = [];
	for (const tenant of tenants) {
		let organizations = tenantOrganizationsMap.get(tenant);
		let employees = tenantEmployeeMap.get(tenant);
		for (const org of organizations) {
		  slots = await dataOperation(connection, slots, noOfAvailabilitySlotsPerOrganization, employees, org);
		}
	}
	return slots;
};

const dataOperation = async (connection: Connection, slots, noOfAvailabilitySlotsPerOrganization, employees, org)=>{
  for (let i = 0; i < noOfAvailabilitySlotsPerOrganization; i++) {
    let slot = new AvailabilitySlots();
    slot.allDay = faker.random.boolean();
    slot.employee = faker.random.arrayElement([faker.random.arrayElement(employees), null]);
    slot.organization = org;
    slot.startTime = faker.date.between(
      new Date(),
      moment(new Date()).add(2, 'months').toDate()
    );
    slot.endTime = faker.date.between(
      slot.startTime,
      moment(slot.startTime).add(7, 'hours').toDate()
    );
    slot.type = faker.random.arrayElement(['Default','Recurring']);
    slots.push(slot);
  }
  await connection.manager.save(slots);
  return slots;
}
