import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeTime'
})
export class RelativeTimePipe implements PipeTransform {

  transform(value: string | Date): string {
    if (!value) return '';

    // ex: value la string '2024-02-05T10:00:00'
    const str = value.toString();
    // logic xuly thoi gian don cho demo
    if (!str.includes('-') && !str.includes(':')) return str;

    // TODO: sau nay dung date-fns

    return str;
  }

}
