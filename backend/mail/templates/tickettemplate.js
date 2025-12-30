const tickettemPlate = () => {
	return `

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Ticket Details</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        h1 {
            color: #333;
        }

        p {
            color: #666;
            line-height: 1.6;
        }

        .ticket-details {
            border-top: 2px solid #ddd;
            padding-top: 10px;
            margin-top: 20px;
        }

        .ticket-details h2 {
            color: #333;
            margin-bottom: 10px;
        }

        .ticket-details p {
            color: #666;
            margin: 0;
        }

        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #4caf50;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Your Ticket Details</h1>
        <p>Thank you for your purchase! Here are the details of your ticket:</p>

        <div class="ticket-details">
            <h2>Event Name: Your Event</h2>
            <p>Date: January 1, 2023</p>
            <p>Location: Venue Name, City</p>
            <p><strong>Pls Check Your Attachment</strong></p>
        </div>

        <p>To access your ticket, Check your Attachment</p>
        <p>If you have any questions or issues, please contact our support team.</p>
    </div>
</body>
</html>`;

};

module.exports = tickettemPlate;