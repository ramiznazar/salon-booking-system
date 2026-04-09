<?php

namespace App\Exceptions;

use Exception;

class ApiException extends Exception
{
    public function __construct(string $message = 'Application error', protected int $status = 400, protected mixed $errors = null)
    {
        parent::__construct($message, $status);
    }

    public function status(): int
    {
        return $this->status;
    }

    public function errors(): mixed
    {
        return $this->errors;
    }
}
