﻿// <auto-generated />
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.EntityFrameworkCore.Storage.Internal;
using Pobs.Domain;
using System;

namespace Pobs.Web.Migrations
{
    [DbContext(typeof(PobsDbContext))]
    partial class PobsDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.0.2-rtm-10011")
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("Pobs.Domain.Entities.Opinion", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<DateTime>("PostedAt");

                    b.Property<int>("PostedByUserId");

                    b.Property<string>("Text")
                        .IsRequired()
                        .HasMaxLength(280);

                    b.Property<int?>("TopicId");

                    b.HasKey("Id");

                    b.HasIndex("PostedByUserId");

                    b.HasIndex("TopicId");

                    b.ToTable("Opinion");
                });

            modelBuilder.Entity("Pobs.Domain.Entities.Topic", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100);

                    b.Property<DateTime>("PostedAt");

                    b.Property<int>("PostedByUserId");

                    b.Property<string>("UrlFragment")
                        .IsRequired()
                        .HasMaxLength(100);

                    b.HasKey("Id");

                    b.HasIndex("PostedByUserId");

                    b.HasIndex("UrlFragment")
                        .IsUnique();

                    b.ToTable("Topic");
                });

            modelBuilder.Entity("Pobs.Domain.Entities.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("FirstName")
                        .IsRequired()
                        .HasMaxLength(50);

                    b.Property<string>("LastName")
                        .IsRequired()
                        .HasMaxLength(50);

                    b.Property<byte[]>("PasswordHash")
                        .IsRequired()
                        .HasMaxLength(64);

                    b.Property<byte[]>("PasswordSalt")
                        .IsRequired()
                        .HasMaxLength(128);

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasMaxLength(50);

                    b.HasKey("Id");

                    b.HasIndex("Username")
                        .IsUnique();

                    b.ToTable("User");
                });

            modelBuilder.Entity("Pobs.Domain.Entities.Opinion", b =>
                {
                    b.HasOne("Pobs.Domain.Entities.User", "PostedByUser")
                        .WithMany()
                        .HasForeignKey("PostedByUserId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("Pobs.Domain.Entities.Topic")
                        .WithMany("Opinions")
                        .HasForeignKey("TopicId");
                });

            modelBuilder.Entity("Pobs.Domain.Entities.Topic", b =>
                {
                    b.HasOne("Pobs.Domain.Entities.User", "PostedByUser")
                        .WithMany("Topics")
                        .HasForeignKey("PostedByUserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });
#pragma warning restore 612, 618
        }
    }
}
