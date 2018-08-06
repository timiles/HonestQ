﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Pobs.Domain;

namespace Pobs.Web.Migrations
{
    [DbContext(typeof(PobsDbContext))]
    [Migration("20180806122148_EnableMultipleTopicsPerStatement")]
    partial class EnableMultipleTopicsPerStatement
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.1.0-rtm-30799")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            modelBuilder.Entity("Pobs.Domain.Entities.Comment", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("AgreementRating");

                    b.Property<long?>("ParentCommentId");

                    b.Property<DateTimeOffset>("PostedAt");

                    b.Property<int>("PostedByUserId");

                    b.Property<string>("Source")
                        .HasMaxLength(2000);

                    b.Property<int>("StatementId");

                    b.Property<string>("Text")
                        .HasMaxLength(280);

                    b.HasKey("Id");

                    b.HasIndex("ParentCommentId");

                    b.HasIndex("PostedByUserId");

                    b.HasIndex("StatementId");

                    b.ToTable("Comment");
                });

            modelBuilder.Entity("Pobs.Domain.Entities.Statement", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<DateTime>("PostedAt");

                    b.Property<int>("PostedByUserId");

                    b.Property<string>("Slug")
                        .IsRequired()
                        .HasMaxLength(280);

                    b.Property<string>("Source")
                        .HasMaxLength(2000);

                    b.Property<int>("Stance");

                    b.Property<string>("Text")
                        .IsRequired()
                        .HasMaxLength(280);

                    b.Property<int>("TopicId");

                    b.HasKey("Id");

                    b.HasIndex("PostedByUserId");

                    b.HasIndex("TopicId");

                    b.ToTable("Statement");
                });

            modelBuilder.Entity("Pobs.Domain.Entities.StatementTopic", b =>
                {
                    b.Property<int>("StatementId");

                    b.Property<int>("TopicId");

                    b.HasKey("StatementId", "TopicId");

                    b.HasIndex("TopicId");

                    b.ToTable("StatementTopic");
                });

            modelBuilder.Entity("Pobs.Domain.Entities.Topic", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<bool>("IsApproved");

                    b.Property<string>("MoreInfoUrl")
                        .HasMaxLength(2000);

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100);

                    b.Property<DateTime>("PostedAt");

                    b.Property<int>("PostedByUserId");

                    b.Property<string>("Slug")
                        .IsRequired()
                        .HasMaxLength(100);

                    b.Property<string>("Summary")
                        .HasMaxLength(280);

                    b.HasKey("Id");

                    b.HasIndex("PostedByUserId");

                    b.HasIndex("Slug")
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

            modelBuilder.Entity("Pobs.Domain.Entities.Comment", b =>
                {
                    b.HasOne("Pobs.Domain.Entities.Comment", "ParentComment")
                        .WithMany("ChildComments")
                        .HasForeignKey("ParentCommentId")
                        .OnDelete(DeleteBehavior.Restrict);

                    b.HasOne("Pobs.Domain.Entities.User", "PostedByUser")
                        .WithMany()
                        .HasForeignKey("PostedByUserId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("Pobs.Domain.Entities.Statement", "Statement")
                        .WithMany("Comments")
                        .HasForeignKey("StatementId")
                        .OnDelete(DeleteBehavior.Restrict);
                });

            modelBuilder.Entity("Pobs.Domain.Entities.Statement", b =>
                {
                    b.HasOne("Pobs.Domain.Entities.User", "PostedByUser")
                        .WithMany()
                        .HasForeignKey("PostedByUserId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("Pobs.Domain.Entities.Topic", "Topic")
                        .WithMany("Statements")
                        .HasForeignKey("TopicId")
                        .OnDelete(DeleteBehavior.Restrict);
                });

            modelBuilder.Entity("Pobs.Domain.Entities.StatementTopic", b =>
                {
                    b.HasOne("Pobs.Domain.Entities.Statement", "Statement")
                        .WithMany("StatementTopics")
                        .HasForeignKey("StatementId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("Pobs.Domain.Entities.Topic", "Topic")
                        .WithMany("StatementTopics")
                        .HasForeignKey("TopicId")
                        .OnDelete(DeleteBehavior.Cascade);
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
