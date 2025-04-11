import React from 'react';

interface Props {
    resetLink: string;
}

export const ResetPasswordTemplate: React.FC<Props> = ({
    resetLink
}) => (
    <div>
        <h2>Перейдите по ссылке для сброса пароля:</h2>
        <p><a href={`${resetLink}`}>СБРОСИТЬ ПАРОЛЬ</a></p>
    </div>
)