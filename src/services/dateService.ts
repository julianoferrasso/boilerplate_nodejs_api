import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/pt-br' // import locale

dayjs.extend(utc);
dayjs.extend(timezone);

export function dateNow(offset: number = 0) {
    // Cria a data atual em UTC
    const now = dayjs.utc();

    // Adiciona o offset à data em milissegundos
    const adjustedDate = now.add(offset, 'minute'); // Pode ajustar o 'minute' para 'hour' ou outra unidade se precisar

    return adjustedDate.toDate(); // Converte para um objeto Date
}

export function dateCompareInHours(endDate: Date, startDate: Date): number {
    return dayjs(endDate).diff(startDate, "hours")
}

export function dateCompareInMinutes(endDate: Date, startDate: Date): number {
    return dayjs(endDate).diff(startDate, "minutes")
}
