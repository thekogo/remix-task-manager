import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat"
import "dayjs/locale/th";

export function displayDateTH(date: string | null | Date): string {
  dayjs.extend(localizedFormat)
  switch (date) {
    case null: return "-"
    default: return dayjs(date).locale("th").format("LLLL น.")
  }
}
