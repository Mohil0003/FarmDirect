using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace FarmDirect__RestfullAPI.Models;

public partial class AuditLog
{
    [Key]
    public int LogId { get; set; }

    [StringLength(50)]
    public string? Action { get; set; }

    [StringLength(50)]
    public string? TableName { get; set; }

    public int? RecordId { get; set; }

    public string? Details { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? Timestamp { get; set; }
}
