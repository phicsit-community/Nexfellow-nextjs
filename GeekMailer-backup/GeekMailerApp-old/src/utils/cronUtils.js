export const generateCronExpression = ({
    customUnit,
    customFrequency,
    customDaysOfWeek,
    customDayOfMonth,
    repeatOption,
    date,
    time,
  }) => {
    const scheduledDateTime = new Date(`${date}T${time}`);
  
    if (repeatOption === 'custom') {
      if (customUnit === 'days') {
        return `0 0 */${customFrequency} * *`;
      } else if (customUnit === 'weeks') {
        const days = customDaysOfWeek.join(',');
        return `0 0 * * ${days}`;
      } else if (customUnit === 'months') {
        return `0 0 ${customDayOfMonth} */${customFrequency} *`;
      }
    } else if (repeatOption === 'none') {
      return `${scheduledDateTime.getMinutes()} ${scheduledDateTime.getHours()} ${scheduledDateTime.getDate()} ${scheduledDateTime.getMonth() + 1} *`;
    } else if (repeatOption === 'daily') {
      return `${scheduledDateTime.getMinutes()} ${scheduledDateTime.getHours()} * * *`;
    } else if (repeatOption === 'weekly') {
      return `${scheduledDateTime.getMinutes()} ${scheduledDateTime.getHours()} * * ${scheduledDateTime.getDay()}`;
    } else if (repeatOption === 'monthly') {
      return `${scheduledDateTime.getMinutes()} ${scheduledDateTime.getHours()} ${scheduledDateTime.getDate()} * *`;
    }
  
    return '* * * * *';
  };
  