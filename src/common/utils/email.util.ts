import * as nodemailer from 'nodemailer';

export class EmailUtil {

  private static transporter =
    nodemailer.createTransport({

      host: process.env.SMTP_HOST,

      port: Number(process.env.SMTP_PORT),

      secure: false,

      auth: {

        user: process.env.SMTP_USER,

        pass: process.env.SMTP_PASS,

      },

    });

  static async sendInvitation(

    to: string,

    inviteLink: string,

    role: string,

    message?: string,

  ) {

    await this.transporter.sendMail({

      from: process.env.SMTP_FROM,

      to,

      subject: 'Rental Inspection Invitation',

      html: `
      <h2>You've been invited</h2>

      <p>You have been invited as <b>${role}</b>.</p>

      <p>${message ?? ''}</p>

      <br>

      <a href="${inviteLink}">
      Accept Invitation
      </a>

      `,

    });

  }


  //---------------------------------------
  // Property Invitation
  //---------------------------------------

  static async sendPropertyInvitation(

    to: string,

    inviteLink: string,

    propertyName: string,

    roleType: string,

    message?: string,

  ) {

    await this.transporter.sendMail({

      from: process.env.SMTP_FROM,

      to,

      subject: 'Property Access Invitation',

      html: `
      <h2>You've been invited to a Property</h2>

      <p>
        You have been invited to access the property
        <b>${propertyName}</b>.
      </p>

      <p>
        Assigned Role:
        <b>${roleType}</b>
      </p>

      ${message ? `<p>${message}</p>` : ''}

      <br>

      <a href="${inviteLink}">
        Accept Property Invitation
      </a>
      `,

    });

  }

}