const translateCronToReadable = (cronExpression) => {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = cronExpression.split(' ');

  const getMonthName = (index) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'
    ];
    return months[index - 1] || 'Unknown';
  };

  const getDayName = (index) => {
    const days = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];
    return days[index] || 'Unknown';
  };

  const formattedMinute = minute === '*' ? 'every minute' : `${minute}`;
  const formattedHour = hour === '*' ? 'every hour' : (hour ? `${hour.padStart(2, '0')}:` : 'unknown hour');
  const formattedDayOfMonth = dayOfMonth === '*' ? '' : `${dayOfMonth}${dayOfMonth !== '1' ? 'th ' : 'st '}`;
  const formattedMonth = month === '*' ? '' : ' ' + `${getMonthName(parseInt(month))}`;
  const formattedDayOfWeek = dayOfWeek === '*' ? '' : ' ' + `${getDayName(parseInt(dayOfWeek))}`;

  let schedule = '';

  if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    schedule = 'Every minute';
  } else {
    if (minute !== '*' || hour !== '*') {
      schedule += `${formattedHour}${formattedMinute}`;
    }
    if (dayOfMonth !== '*') {
      schedule += ` ${formattedDayOfMonth}`;
    }
    if (month !== '*') {
      schedule += ` ${formattedMonth}`;
    }
    if (dayOfWeek !== '*') {
      schedule += ` ${formattedDayOfWeek}`;
    }
  }

  return schedule.replace(/\s{2,}/g, ' ');
};

export default translateCronToReadable;
