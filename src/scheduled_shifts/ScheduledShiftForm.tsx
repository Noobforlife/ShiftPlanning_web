import React, { Component, EventHandler, FormEvent } from 'react';

import { Employee } from 'employees/types';
import { ScheduledShiftDto } from 'scheduled_shifts/types';

import Formie from 'react-formie';
import Button from 'shared/Button';
import { Input, NumberInput, SuggestionInput } from 'shared/fields';

interface Props {
  handleSubmit: EventHandler<FormEvent<HTMLFormElement>>;
  employees: Employee[];
  initial: ScheduledShiftDto;
  onDelete: any;
  submitText: string;
}

export default class ScheduleShiftForm extends Component<Props, {}> {
  handleDelete = (e: any) => {
    e.preventDefault();

    const { onDelete, initial } = this.props;

    onDelete(initial.id);
  };

  render() {
    const { employees: employeeList, onDelete } = this.props;

    if (!employeeList) {
      return <div />;
    }

    const initial = {
      ...this.props.initial,
      employeeIds: this.props.initial.employees.map(e => e.id),
    };

    const timeValidator = (v: string) =>
      !/\d\d:\d\d/.test(v) && 'Time format seems to be wrong';

    const endValidator = (values: typeof initial) => {
      if (timeValidator(values.end)) {
        return timeValidator(values.end);
      }

      if (
        values.start &&
        values.end &&
        values.start.slice(0, values.end.length) > values.end
      ) {
        return 'End has to occur later than start';
      }

      if (values.start && values.end && values.start === values.end) {
        return 'End cannot be the same time as start';
      }

      return false;
    };

    return (
      <Formie
        onSubmit={this.props.handleSubmit}
        initial={initial}
        validate={{
          start: ({ start }: typeof initial) => timeValidator(start),
          end: (values: typeof initial) => endValidator(values),
          employeeIds: ({ employeeIds }: typeof initial) =>
            employeeIds.length === 0 && 'Must not be empty',
        }}
        form={({
          values,
          pristine,
          field,
          submitting,
          invalid,
          handleSubmit,
        }) => (
          <form className="ui form" onSubmit={handleSubmit}>
            {field('start', props => (
              <Input {...props} placeholder="08:00" label="Start" />
            ))}
            {field('end', props => (
              <Input {...props} placeholder="10:00" label="End" />
            ))}
            {field('minOnShift', props => (
              <NumberInput {...props} placeholder="Min on shift" />
            ))}
            {field('maxOnShift', props => (
              <NumberInput {...props} placeholder="Max on shift" />
            ))}
            {field('employeeIds', ({ update }) => (
              <div className="ui field">
                <label>
                  Employees
                  <SuggestionInput
                    initial={initial.employeeIds}
                    items={employeeList.map(e => ({
                      id: e.id,
                      name: `${e.firstName} ${e.lastName}`,
                      locked: (values as any).lockedEmployeeIds.includes(e.id),
                    }))}
                    onChange={vals => update(vals.map(v => v.id))}
                    onToggleLock={vals =>
                      field('lockedEmployeeIds', ({ update: u }) =>
                        u(vals.map(v => v.id)),
                      )}
                  />
                </label>
              </div>
            ))}

            <Button secondary disabled={submitting || pristine || invalid}>
              {this.props.submitText}
            </Button>

            {onDelete && (
              <Button
                negative
                basic
                disabled={submitting}
                onClick={this.handleDelete}
              >
                Delete
              </Button>
            )}
          </form>
        )}
      />
    );
  }
}
